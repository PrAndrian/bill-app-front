/**
 * @jest-environment jsdom
 */


import {screen, waitFor} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)
$.fn.modal = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When click on eye-icon of a bill", ()=>{
      it("should render a modal ",async()=>{
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        //Simuler onNavigate
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        //Simuler store
        const store = mockStore

        //Crer un user 
        const userObj = {
          type:"Employee",
        }
        
        //Simuler localStore avec le user dedans 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify(userObj))

        //Creation of Bills
        const allBills = new Bills({document, onNavigate, store, localStorage })

        //Création d'un event onChange
        const event = new Event('click')

        const eye_icon = screen.getAllByTestId("icon-eye")

        eye_icon[0].dispatchEvent(event)

        allBills.handleClickIconEye(eye_icon[0])

        
        await waitFor(() =>{
          expect(screen.getByText("Justificatif")).toBeTruthy() // <---[ A voir si si c'est bon ]
        })
      })
    })

    // test d'intégration GET
    describe("When I navigate to Bills Page", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getAllByText("Accepté"))
        const contentPending  = await screen.getAllByText("En attente")
        expect(contentPending).toBeTruthy()
        const contentRefused  = await screen.getAllByText("Refused")
        expect(contentRefused).toBeTruthy()
        expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
      })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Admin',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

    })
    })
  })
