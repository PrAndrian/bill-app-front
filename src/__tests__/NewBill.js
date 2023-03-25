/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      test("Then file must be of extention png, jpeg, jpg ", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const a = new NewBill({document})
    
        const fileInput = screen.getByTestId('file')
        fileInput.accept = '.png, .jpeg, .jpg'
    
        const file = new File(['dummy file'], 'test.pdf', {type: 'application/pdf'})
        const event = new Event('change', { bubbles: true })
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        })
        fileInput.dispatchEvent(event)
    
        expect(a.handleChangeFile(event)).toBe(-1)
      })
    })
  })
})