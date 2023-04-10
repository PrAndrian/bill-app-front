/**
 * @jest-environment jsdom
 */


import {screen, waitFor} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)
$.fn.modal = jest.fn(); //<- dû à la fonction de bootstrap non reconnnu par Jest

describe("Given I am connected as an employee", () => {

  function initialisationBills(){
    document.body.innerHTML = BillsUI({ data: bills })

    //Simuler onNavigate
    const onNavigate = jest.fn(()=>{})

    //Simuler store
    const store = mockStore

    //Crer un user 
    const userObj = {
      type:"Employee",
      email:"employee@test.tld",
      password:"employee",
      status:"connected"
    }

    //Simuler localStore avec le user dedans 
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify(userObj))

    //Creation of Bills
    return new Bills({document, onNavigate, store, localStorage })
  }
  
  describe("When I am on Bills Page", () => {
    let theBills
    beforeEach(() =>{
      theBills = initialisationBills()
    })
  
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
      //Test d'intégration
      test("Then render a modal",async()=>{
        const eye_icons = screen.getAllByTestId("icon-eye")
        
        userEvent.click(eye_icons[0])

        await waitFor(() =>{
          expect($('#modaleFile').find(".modal-body").innerHTML != '').toBe(true) // <---[ Verify si le justificatif est bien rendu dans le HTML ]
          expect($('#modaleFile').css("display") != "none").toBeTruthy() // <---[ Verify si la modal est apparu ]
        })
      })
    })
    
    //Test unitaire handleClickNewBill <-------------------------------- à Voir
    
    describe('When click on button "Note de frais"',()=>{
      test('Then handleClickNewBill is called',()=>{

        const handleClickNewBill = jest.fn(theBills.handleClickNewBill())
        
        const button = screen.getByTestId('btn-new-bill')
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
    
        expect(handleClickNewBill).toHaveBeenCalled();
        handleClickNewBill.mockRestore();
      })
    })

    // Test d'intégration -> GET
    describe("When I navigate to Bills Page", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ 
          type:"Employee",
          email:"a@a",
          password:"employee",
          status:"connected"
        }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => {
          expect(screen.getByText("accepted")).toBeTruthy()
          expect(screen.getAllByText("pending")).toBeTruthy()
          expect(screen.getAllByText("refused")).toBeTruthy()
        })
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
            type:"Employee",
            email:"a@a",
            password:"employee",
            status:"connected"
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
          window.onNavigate(ROUTES_PATH.Bills)
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
    
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })
  })
})