// src/middleware.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAuth } from "./middleware";

describe("checkAuth", () => {
  beforeEach(() => {
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpass";
  });

  afterEach(() => {
    delete process.env.AUTH_USERNAME;
    delete process.env.AUTH_PASSWORD;
  });

  it("returns false when header is null", () => {
    expect(checkAuth(null)).toBe(false);
  });

  it("returns false when header is not Basic scheme", () => {
    expect(checkAuth("Bearer sometoken")).toBe(false);
  });

  it("returns false when credentials are wrong", () => {
    const header = "Basic " + btoa("wrong:credentials");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns false when only username is wrong", () => {
    const header = "Basic " + btoa("baduser:testpass");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns false when only password is wrong", () => {
    const header = "Basic " + btoa("testuser:badpass");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns true when credentials are correct", () => {
    const header = "Basic " + btoa("testuser:testpass");
    expect(checkAuth(header)).toBe(true);
  });

  it("handles password containing a colon", () => {
    process.env.AUTH_PASSWORD = "pass:with:colons";
    const header = "Basic " + btoa("testuser:pass:with:colons");
    expect(checkAuth(header)).toBe(true);
  });
});
