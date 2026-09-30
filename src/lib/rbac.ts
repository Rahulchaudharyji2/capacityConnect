import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireUser();
  const userRoles = user.roles.map(r => r.role.name);
  const hasRole = allowedRoles.some(role => userRoles.includes(role));
  
  if (!hasRole) {
    throw new Error('Forbidden: Insufficient permissions.');
  }
  return user;
}

export async function canManageCourse(courseId: string) {
  const user = await requireUser();
  const userRoles = user.roles.map(r => r.role.name);
  
  if (userRoles.includes('ADMIN')) return true;

  if (userRoles.includes('TRAINER')) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course && course.ownerId === user.id) {
      return true;
    }
  }

  throw new Error('Forbidden: You do not have permission to manage this course.');
}

export async function canViewCourse(courseId: string) {
  const user = await requireUser();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  
  if (!course) return false;
  if (course.isPublished) return true;
  
  const userRoles = user.roles.map(r => r.role.name);
  if (userRoles.includes('ADMIN')) return true;
  if (userRoles.includes('TRAINER') && course.ownerId === user.id) return true;
  
  throw new Error('Forbidden: This course is not published.');
}
