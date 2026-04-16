import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import ProjectStructurePage from "../ProjectStructurePage"

describe("ProjectStructurePage integration", () => {
  it("يدمج مكون Collapsible داخل صفحة الهيكلية ويعمل بشكل صحيح", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectStructurePage />
      </MemoryRouter>
    )

    expect(screen.getByRole("heading", { name: "هيكيلة المشروع" })).toBeInTheDocument()

    const overviewTrigger = screen.getByRole("button", { name: /نظرة عامة على المشروع/i })
    const modulesTrigger = screen.getByRole("button", { name: /الوحدات الرئيسية/i })

    expect(overviewTrigger).toHaveAttribute("aria-expanded", "true")
    expect(modulesTrigger).toHaveAttribute("aria-expanded", "false")

    await user.click(modulesTrigger)

    expect(modulesTrigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/إدارة الطلاب - إضافة، تعديل، حذف، وعرض بيانات الطلاب/i)).toBeInTheDocument()
  })
})
