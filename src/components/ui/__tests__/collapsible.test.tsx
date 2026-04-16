import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Collapsible } from "../collapsible"

describe("Collapsible", () => {
  it("يفتح ويغلق المحتوى مع تحديث خصائص الوصول", async () => {
    const user = userEvent.setup()

    render(
      <Collapsible
        title="إعدادات العرض"
        description="تحكم في تفاصيل المكون"
      >
        محتوى داخلي قابل للعرض
      </Collapsible>
    )

    const trigger = screen.getByRole("button", { name: /إعدادات العرض/i })

    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("region")).not.toBeInTheDocument()

    await user.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region")).toHaveTextContent("محتوى داخلي قابل للعرض")

    await user.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("يدعم النمط المتحكم به ويستدعي onOpenChange", async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    const { rerender } = render(
      <Collapsible
        title="مكون متحكم به"
        open={false}
        onOpenChange={handleOpenChange}
      >
        تفاصيل متقدمة
      </Collapsible>
    )

    const trigger = screen.getByRole("button", { name: /مكون متحكم به/i })

    await user.click(trigger)

    expect(handleOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("region")).not.toBeInTheDocument()

    rerender(
      <Collapsible
        title="مكون متحكم به"
        open={true}
        onOpenChange={handleOpenChange}
      >
        تفاصيل متقدمة
      </Collapsible>
    )

    expect(screen.getByRole("region")).toHaveTextContent("تفاصيل متقدمة")
  })
})
