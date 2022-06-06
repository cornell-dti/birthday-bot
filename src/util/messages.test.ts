import { getNextInstanceOfDay } from ".";
import { generateBirthdayStatus } from "./messages";

jest.useFakeTimers();

describe("generateBirthdayStatus with existing displayName", () => {
  const displayName = "Jim Halpert";
  const birthday = new Date("1978-10-01");

  it("birthday is today", async () => {
    const expectedStatus =
      ":tada: Jim Halpert, it's your birthday *today*! Cake :birthday: and ice cream :ice_cream: is on it's way! :enoch-fish:";
    jest.setSystemTime(new Date("2022-10-01"));
    const nextBirthday = getNextInstanceOfDay(birthday);
    const status = generateBirthdayStatus(displayName, nextBirthday);
    expect(status).toMatch(expectedStatus);
  });

  it("birthday is tomorrow", async () => {
    const expectedStatus =
      "Your birthday is currently set to *tomorrow*! :ahh:";
    jest.setSystemTime(new Date("2022-09-30"));
    const nextBirthday = getNextInstanceOfDay(birthday);
    const status = generateBirthdayStatus(displayName, nextBirthday);
    expect(status).toMatch(expectedStatus);
  });

  it("birthday is 2 days ago", async () => {
    const expectedStatus =
      "Your birthday is currently set to *October 1st* - that's 363 days away!";
    jest.setSystemTime(new Date("2022-10-03"));
    const nextBirthday = getNextInstanceOfDay(birthday);
    const status = generateBirthdayStatus(displayName, nextBirthday);
    expect(status).toMatch(expectedStatus);
  });
});
