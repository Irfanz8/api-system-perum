import supabase from '../config/supabase.js';
import db from '../config/database.js';
import { ROLES, isValidRole } from '../utils/roles.js';

/**
 * Get OAuth URL untuk berbagai provider
 */
export const getOAuthUrl = async (req, res) => {
  try {
    const { provider = 'google', redirectTo = process.env.FRONTEND_URL } = req.query;

    const finalRedirectUrl = redirectTo.includes('/auth/callback') 
      ? `${redirectTo}?provider=${provider}` 
      : `${redirectTo}/auth/callback?provider=${provider}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: finalRedirectUrl
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

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
export const handleOAuthCallback = async (req, res) => {
  try {
    const access_token = req.body?.access_token || req.query?.access_token;
    const refresh_token = req.body?.refresh_token || req.query?.refresh_token;

    console.log('OAuth callback received:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      method: req.method,
      body: req.body ? Object.keys(req.body) : 'none',
      query: req.query ? Object.keys(req.query) : 'none'
    });

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token not provided. Please include access_token in request body or query params.'
      });
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (error) {
      console.error('Supabase setSession error:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const user = data?.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to get user from session'
      });
    }

    await saveUserToDatabase(user, 'oauth');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
          role: user.user_metadata?.role || ROLES.USER,
          avatar: user.user_metadata?.avatar_url
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
      error: 'OAuth callback failed: ' + (error.message || 'Unknown error')
    });
  }
};

/**
 * Sign up dengan email dan password
 */
export const signUp = async (req, res) => {
  try {
    const { email, password, name, role = ROLES.USER } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password wajib diisi'
      });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

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

    if (data.user) {
      await saveUserToDatabase(data.user, 'email');
    }

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
export const signIn = async (req, res) => {
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
export const signOut = async (req, res) => {
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
export const refreshToken = async (req, res) => {
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
export const getProfile = async (req, res) => {
  try {
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
export const updateProfile = async (req, res) => {
  try {
    const { name, role } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const updates = {};
    if (name) updates.name = name;
    
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
 * Helper: Save user to database
 */
async function saveUserToDatabase(user, authMethod = 'oauth') {
  try {
    if (!user || !user.id) {
      console.error('Invalid user object provided to saveUserToDatabase');
      return;
    }

    const checkResult = await db`SELECT id, role FROM users WHERE id = ${user.id}`;

    const username = user.user_metadata?.name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0];
    const email = user.email;
    const role = user.user_metadata?.role || ROLES.USER;
    const passwordHash = authMethod === 'email' ? null : 'oauth';

    let isNewUser = false;

    if (checkResult.length === 0) {
      isNewUser = true;
      const result = await db`
        INSERT INTO users (id, username, email, password_hash, role, is_active)
        VALUES (${user.id}, ${username}, ${email}, ${passwordHash}, ${role}, true)
        ON CONFLICT (id) DO NOTHING
      `;
      
      if (result.count > 0) {
        console.log('✅ User saved to local database:', email, `(${authMethod})`);
      }
    } else {
      await db`
        UPDATE users 
        SET username = ${username}, 
            email = ${email}, 
            role = COALESCE(${role}, role),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `;
      console.log('✅ User updated in local database:', email);
    }

    if (isNewUser) {
      await assignDefaultRBAC(user.id, role);
    }
  } catch (error) {
    console.error('❌ Error saving user to database:', error.message);
    console.error('User data:', { id: user?.id, email: user?.email });
  }
}

/**
 * Assign default RBAC permissions
 */
async function assignDefaultRBAC(userId, role) {
  try {
    console.log(`🔐 Assigning default RBAC for user ${userId} with role ${role}`);

    const modules = await db`SELECT id, code FROM modules WHERE is_active = true`;
    const divisions = await db`SELECT id, code FROM divisions WHERE is_active = true`;

    for (const mod of modules) {
      let canView = false, canCreate = false, canUpdate = false, canDelete = false;

      if (role === ROLES.SUPERADMIN) {
        canView = canCreate = canUpdate = canDelete = true;
      } else if (role === ROLES.ADMIN) {
        canView = true;
        if (mod.code !== 'roles') {
          canCreate = canUpdate = canDelete = true;
        }
      } else {
        if (['dashboard', 'keuangan', 'properti', 'penjualan', 'persediaan'].includes(mod.code)) {
          canView = true;
        }
      }

      await db`
        INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
        VALUES (${userId}, ${mod.id}, ${canView}, ${canCreate}, ${canUpdate}, ${canDelete})
        ON CONFLICT (user_id, module_id) DO NOTHING
      `;
    }

    if (role === ROLES.ADMIN || role === ROLES.SUPERADMIN) {
      for (const div of divisions) {
        await db`
          INSERT INTO user_divisions (user_id, division_id)
          VALUES (${userId}, ${div.id})
          ON CONFLICT (user_id, division_id) DO NOTHING
        `;
      }
    }

    console.log(`✅ Default RBAC assigned for user ${userId}`);
  } catch (error) {
    console.error('❌ Error assigning default RBAC:', error.message);
  }
}

/**
 * Reset password
 */
export const resetPassword = async (req, res) => {
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
export const resendVerificationEmail = async (req, res) => {
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