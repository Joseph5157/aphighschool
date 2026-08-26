// @vitest-environment node
//
// PostFormClient hand-copies the labels for DocType, OrderState and PostStatus
// because, unlike lib/validation/post.ts, it is a client component: importing
// @prisma/client here to derive the values the way the validator does would
// pull Prisma into the client bundle (Task 14b review, MAJOR 2). A hand-copied
// list has no compiler or runtime tie back to prisma/schema.prisma, so before
// this test existed, adding a value to an enum passed tsc, passed the
// validator's own derived-enum test, and the admin <select> simply never
// offered the new value — nothing went red anywhere in the suite.
//
// Labels are human text ("Government Order (GO)") and cannot be derived from
// the enum member name, so this only pins the KEY set — every enum value has
// an option, and every option key is a real enum value — not the labels.
import { describe, it, expect } from "vitest";
import { DocType, OrderState, PostStatus } from "@prisma/client";
import {
  DOCUMENT_TYPE_OPTIONS,
  ORDER_STATE_OPTIONS,
  STATUS_OPTIONS,
} from "@/app/admin/posts/_components/PostFormClient";

function keysOf(options: string[][]): string[] {
  return options.map(([key]) => key);
}

describe("PostFormClient option lists track the Prisma schema", () => {
  it("offers exactly the DocType enum values", () => {
    expect(new Set(keysOf(DOCUMENT_TYPE_OPTIONS))).toEqual(new Set(Object.values(DocType)));
  });

  it("offers exactly the OrderState enum values", () => {
    expect(new Set(keysOf(ORDER_STATE_OPTIONS))).toEqual(new Set(Object.values(OrderState)));
  });

  it("offers exactly the PostStatus enum values", () => {
    expect(new Set(keysOf(STATUS_OPTIONS))).toEqual(new Set(Object.values(PostStatus)));
  });

  it("has no duplicate keys in any option list", () => {
    for (const options of [DOCUMENT_TYPE_OPTIONS, ORDER_STATE_OPTIONS, STATUS_OPTIONS]) {
      const keys = keysOf(options);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
