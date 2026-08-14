import { User, Role } from '../types';
import { Repository } from '../db/storage';

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
  requiresPasswordChange?: boolean;
}

export class AuthService {
  /**
   * Mock authentication service.
   * TODO: Connect real OAuth / JWT authentication backend when API specification is provided.
   */

  static login(email: string, password: string): LoginResult {
    const users = Repository.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, message: 'Invalid email address or password.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account has been deactivated. Please contact your administrator.' };
    }

    // Demo password check - accepts standard demo passwords or updated password
    if (password.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    if (user.requiresPasswordChange) {
      return {
        success: true,
        user,
        requiresPasswordChange: true,
        message: 'Password change required on first login.',
      };
    }

    return {
      success: true,
      user,
      requiresPasswordChange: false,
      message: 'Login successful.',
    };
  }

  static completePasswordChange(userId: string, newPassword: string): { success: boolean; message: string; updatedUser?: User } {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const users = Repository.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'User account not found.' };
    }

    users[userIndex].requiresPasswordChange = false;
    users[userIndex].updatedAt = new Date().toISOString();
    Repository.saveUsers(users);

    return {
      success: true,
      message: 'Password changed successfully. You may now access the system.',
      updatedUser: users[userIndex],
    };
  }

  // Admin User Management
  static getAllUsers(): User[] {
    return Repository.getUsers();
  }

  static createStaffAccount(adminUser: User, data: { email: string; name: string; initialPassword: string }): { success: boolean; message: string; user?: User } {
    return this.createUser({ name: data.name, email: data.email, password: data.initialPassword, role: 'STAFF' });
  }

  static createUser(data: { email: string; name: string; password?: string; role: Role }): { success: boolean; message: string; user?: User } {
    const users = Repository.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      role: data.role,
      isActive: true,
      requiresPasswordChange: true, // MUST force password change on first login
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    Repository.saveUsers(users);

    return {
      success: true,
      message: `Account created for ${newUser.name}. First login will require a password change.`,
      user: newUser,
    };
  }

  static toggleUserStatus(adminUser: User, targetUserId: string): { success: boolean; message: string } {
    return this.toggleUserActive(targetUserId);
  }

  static toggleUserActive(userId: string): { success: boolean; message: string } {
    const users = Repository.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString();
    Repository.saveUsers(users);

    return {
      success: true,
      message: `User ${target.name} is now ${target.isActive ? 'Active' : 'Deactivated'}.`,
    };
  }

  static resetUserPasswordToTemp(userId: string, tempPassword?: string): { success: boolean; message: string } {
    const users = Repository.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    target.requiresPasswordChange = true;
    target.updatedAt = new Date().toISOString();
    Repository.saveUsers(users);

    return {
      success: true,
      message: `User ${target.name} password reset. Forced password change on next login.`,
    };
  }
}
