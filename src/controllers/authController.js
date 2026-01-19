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
    await saveUserToDatabase(user);

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
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
      data: {
        user: data.user
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
      return res.status(401).json({
        success: false,
        error: 'Email atau password salah'
      });
    }

    // Simpan user ke database lokal jika belum ada
    await saveUserToDatabase(data.user);

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
 */
async function saveUserToDatabase(user) {
  try {
    const checkQuery = 'SELECT id FROM users WHERE id = $1';
    const checkResult = await db.query(checkQuery, [user.id]);

    if (checkResult.rows.length === 0) {
      const insertQuery = `
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(insertQuery, [
        user.id,
        user.user_metadata.name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0],
        user.email,
        'oauth_user', // Placeholder karena password tidak tersedia untuk OAuth
        user.user_metadata.role || ROLES.USER
      ]);
      console.log('User saved to local database:', user.email);
    }
  } catch (error) {
    console.error('Error saving user to database:', error);
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