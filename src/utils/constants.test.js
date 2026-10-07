import { describe, expect, it } from "vitest";
import { STAFF_ROLES, staffRoleLabel } from "./constants";

describe("staffRoleLabel", () => {
  it("names every role the database allows", () => {
    expect(STAFF_ROLES.map((role) => role.value)).toEqual([
      "admin",
      "front_desk",
      "housekeeping",
      "maintenance",
    ]);
    expect(staffRoleLabel("front_desk")).toBe("Front desk");
  });

  it("falls back to a neutral label", () => {
    expect(staffRoleLabel(undefined)).toBe("Staff");
  });
});
