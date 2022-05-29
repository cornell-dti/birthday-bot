import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const upsertBirthdayEntry = (slackUser: string, birthday: Date) =>
  prisma.birthday.upsert({
    create: { slackUser, birthday },
    update: { birthday },
    where: { slackUser },
  });

export const removeBirthdayEntry = (slackUser: string) =>
  prisma.birthday.deleteMany({
    where: { slackUser },
  });

export const findBirthdayOfUser = (slackUser: string) =>
  prisma.birthday.findFirst({
    select: {
      birthday: true,
    },
    where: {
      slackUser,
    },
  });

export const findUsersWithBirthday = (day: Date) =>
  prisma.birthday.findMany({
    select: {
      slackUser: true,
    },
    where: {
      birthday: {
        equals: day,
      },
    },
  });
