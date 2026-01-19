const supabase = require('../config/supabase');
const db = require('../config/database');
const { ROLES, isValidRole } = require('../utils/roles');

/**
 * Get OAuth URL untuk berbagai provider
 */
exports.getOAuthUrl = async (req, res) => {
  try {
    const { provider = 'google', redirectTo = process.env.FRONTEND_URL } = req.query;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${redirectTo}/auth/callback?provider=${provider}`
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        url: data.url,
        provider: provider
      }
    });
  } catch (error) {
    console.error('Get OAuth URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get OAuth URL'
    });
  }
};

/**
 * Handle OAuth callback
 */
exports.handleOAuthCallback = async (req, res) => {
  try {
    const { access_token, refresh_token } = req.query;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token not provided'
      });
    }

    // Set session dengan Supabase
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Simpan user ke database lokal jika belum ada
    await saveUserToDatabase(user, 'oauth');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata.name || user.email,
          role: user.user_metadata.role || ROLES.USER,
          avatar: user.user_metadata.avatar_url
        },
        session: {
          access_token,
          refresh_token
        }
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'OAuth callback failed'
    });
  }
};

/**
 * Sign up dengan email dan password
 */
exports.signUp = async (req, res) => {
  try {
    const { email, password, name, role = ROLES.USER } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password wajib diisi'
      });
    }

    // Validasi role
    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    // Hanya superadmin yang bisa membuat admin atau superadmin baru
    // Untuk sekarang, default semua user baru adalah 'user'
    const finalRole = role === ROLES.USER ? ROLES.USER : ROLES.USER;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: finalRole
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Gagal melakukan registrasi'
      });
    }

    // Simpan user ke database lokal jika user sudah terverifikasi atau tidak perlu verifikasi
    if (data.user) {
      await saveUserToDatabase(data.user, 'email');
    }

    // Cek apakah email perlu diverifikasi
    const needsVerification = data.user && !data.session;
    
    res.status(201).json({
      success: true,
      message: needsVerification 
        ? 'Registrasi berhasil. Silakan cek email untuk verifikasi sebelum login.'
        : 'Registrasi berhasil. Anda sudah bisa login.',
      needsEmailVerification: needsVerification,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name || data.user?.email,
          role: data.user?.user_metadata?.role || ROLES.USER
        },
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        } : null
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({
      success: false,
      error: 'Registrasi gagal'
    });
  }
};

/**
 * Sign in dengan email dan password
 */
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password wajib diisi'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Signin error:', error);
      
      // Berikan error message yang lebih spesifik
      let errorMessage = 'Email atau password salah';
      
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'User tidak ditemukan. Silakan daftar terlebih dahulu.';
      } else {
        errorMessage = error.message || 'Gagal melakukan login';
      }
      
      return res.status(401).json({
        success: false,
        error: errorMessage,
        code: error.status || 'AUTH_ERROR'
      });
    }

    // Simpan user ke database lokal jika belum ada
    await saveUserToDatabase(data.user, 'email');

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name || data.user.email,
          role: data.user.user_metadata.role || ROLES.USER,
          avatar: data.user.user_metadata.avatar_url
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      error: 'Login gagal'
    });
  }
};

/**
 * Sign out
 */
exports.signOut = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout gagal'
    });
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token not provided'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // User sudah tersedia dari auth middleware
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, role } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updates = {};
    if (name) updates.name = name;
    
    // Hanya superadmin yang bisa mengubah role
    if (role) {
      if (userRole !== ROLES.SUPERADMIN) {
        return res.status(403).json({
          success: false,
          error: 'Hanya superadmin yang dapat mengubah role user'
        });
      }
      
      if (!isValidRole(role)) {
        return res.status(400).json({
          success: false,
          error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
        });
      }
      
      updates.role = role;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name || data.user.email,
        role: data.user.user_metadata.role || ROLES.USER
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * Fungsi helper untuk menyimpan user ke database lokal
 * @param {Object} user - User object dari Supabase Auth
 * @param {string} authMethod - 'email' untuk email/password, 'oauth' untuk OAuth
 */
async function saveUserToDatabase(user, authMethod = 'oauth') {
  try {
    if (!user || !user.id) {
      console.error('Invalid user object provided to saveUserToDatabase');
      return;
    }

    const checkQuery = 'SELECT id FROM users WHERE id = $1';
    const checkResult = await db.query(checkQuery, [user.id]);

    const username = user.user_metadata?.name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0];
    const email = user.email;
    const role = user.user_metadata?.role || ROLES.USER;
    
    // Password hash: null untuk email/password (di-handle Supabase), 'oauth' untuk OAuth
    const passwordHash = authMethod === 'email' ? null : 'oauth';

    if (checkResult.rows.length === 0) {
      // User baru, insert
      const insertQuery = `
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `;
      const result = await db.query(insertQuery, [
        user.id,
        username,
        email,
        passwordHash,
        role
      ]);
      
      if (result.rowCount > 0) {
        console.log('✅ User saved to local database:', email, `(${authMethod})`);
      }
    } else {
      // User sudah ada, update metadata jika perlu
      const updateQuery = `
        UPDATE users 
        SET username = $1, 
            email = $2, 
            role = COALESCE($3, role),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `;
      await db.query(updateQuery, [
        username,
        email,
        role,
        user.id
      ]);
      console.log('✅ User updated in local database:', email);
    }
  } catch (error) {
    console.error('❌ Error saving user to database:', error.message);
    console.error('User data:', { id: user?.id, email: user?.email });
    // Jangan throw error, biarkan flow berlanjut
  }
}

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email wajib diisi'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Link reset password telah dikirim ke email'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Reset password failed'
    });
  }
};

/**
 * Resend verification email
 */
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email wajib diisi'
      });
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Gagal mengirim email verifikasi'
      });
    }

    res.json({
      success: true,
      message: 'Email verifikasi telah dikirim ulang. Silakan cek email Anda.'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengirim email verifikasi'
    });
  }
};