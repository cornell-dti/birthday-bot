import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const upsertBirthdayEntry = (user: string, birthday: Date) =>
  prisma.birthday.upsert({
    create: { user, birthday },
    update: { birthday },
    where: { user },
  });

export const removeBirthdayEntry = (user: string) =>
  prisma.birthday.deleteMany({
    where: { user },
  });

export const findBirthdayOfUser = (user: string) =>
  prisma.birthday.findFirst({
    select: {
      birthday: true,
    },
    where: {
      user,
    },
  });

export const findUsersWithBirthday = (day: Date) =>
  prisma.birthday.findMany({
    select: {
      user: true,
    },
    where: {
      birthday: {
        equals: day,
      },
    },
  });
