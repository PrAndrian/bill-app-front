/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      test("Then the file is of extention png or jpeg or jpg ", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        //Simuler onNavigate
        // const onNavigate = ROUTES(ROUTES_PATH['NewBill']) <--- test
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
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

        //Création d'un nouveau NewBill grâce à @document, @onNavigate, @store, @localstore
        const aNewBill = new NewBill({document,onNavigate,store,locaStore: window.localStorage})
        
        //récurépation de l'input de type file
        const fileInput = screen.getByTestId('file')
        
        //Création d'un fichier test en jpg
        const file = new File(['dummy file'], 'test.jpg', {type: 'image/jpg'})
        //Création d'un event onChange
        const event = new Event('change', { bubbles: true })
        //Attribution de la valeur de l'input au fichier test
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        })
        
        //Dispatch de l'event
        fileInput.dispatchEvent(event)
        
        // Test de la fonction handleChangeFile
        // si erreur retourne -1  
        // sinon pas de retour 
        expect(aNewBill.handleChangeFile(event)).toBe(undefined)
      })

      test("Then the file don't accept other extention than png or jpeg or jpg ", () => {
        const html = NewBillUI()
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
          email:"employee@test.tld",
          password:"employee",
          status:"connected"
        }
        
        //Simuler localStore avec le user dedans 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify(userObj))

        //Création d'un nouveau NewBill grâce à @document, @onNavigate, @store, @localstore
        const aNewBill = new NewBill({document,onNavigate,store,locaStore: window.localStorage})
        
        //récurépation de l'input de type file
        const fileInput = screen.getByTestId('file')
        
        //Création d'un fichier test en jpg
        const file = new File(['dummy file'], 'test.pdf', {type: 'application/pdf'})
        //Création d'un event onChange
        const event = new Event('change', { bubbles: true })
        //Attribution de la valeur de l'input au fichier test
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        })
        
        //Dispatch de l'event
        fileInput.dispatchEvent(event)
        
        // Test de la fonction handleChangeFile
        // si erreur retourne -1  
        // sinon pas de retour 
        expect(aNewBill.handleChangeFile(event)).toBe(-1)
      })
    })
  })
})