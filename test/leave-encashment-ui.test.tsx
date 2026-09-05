import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import LeaveEncashmentUI from "@/app/(public)/tools/leave-encashment/_components/LeaveEncashmentUI";

describe("Leave Encashment UI", () => {
  it("excludes HPL from surrender and offers only 15 or 30 days", () => {
    render(<LeaveEncashmentUI />);

    expect(screen.getByLabelText("Calculation Mode")).toHaveValue("surrender");
    expect(screen.queryByLabelText("HPL Days (Half Pay)")).not.toBeInTheDocument();
    expect(screen.getByLabelText("EL Days to Surrender")).toHaveTextContent("15 days");
    expect(screen.getByLabelText("EL Days to Surrender")).toHaveTextContent("30 days");
    expect(screen.getByLabelText("EL surrender guidance")).toHaveTextContent(/competent authority/i);
  });

  it("switches to the existing retirement estimate and shows HPL input", () => {
    render(<LeaveEncashmentUI />);
    fireEvent.change(screen.getByLabelText("Calculation Mode"), { target: { value: "retirement" } });

    expect(screen.getByLabelText("EL Days to Encash")).toBeInTheDocument();
    expect(screen.getByLabelText("HPL Days (Half Pay)")).toBeInTheDocument();
    expect(screen.getByText(/This retirement figure is an estimate/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("EL Days to Encash"), { target: { value: "45" } });
    fireEvent.change(screen.getByLabelText("Calculation Mode"), { target: { value: "surrender" } });

    expect(screen.getByLabelText("EL Days to Surrender")).toHaveValue("15");
    expect(screen.queryByLabelText("HPL Days (Half Pay)")).not.toBeInTheDocument();
  });

  it("uses AP-only copy on the leave route and UI", () => {
    const pageSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/tools/leave-encashment/page.tsx"), "utf8");
    const uiSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/tools/leave-encashment/_components/LeaveEncashmentUI.tsx"), "utf8");

    expect(pageSource).toContain("AP government school teachers");
    expect(pageSource).not.toContain("AP and TS");
    expect(uiSource).toContain("Surrender in AP?");
    expect(uiSource).not.toContain("AP & TS");
  });
});
