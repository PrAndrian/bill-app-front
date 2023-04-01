/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import bills from "../__mocks__/store.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      test("Then file is of extention png or jpeg or jpg ", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        //Simuler onNavigate
        const onNavigate = ROUTES(ROUTES_PATH['NewBill'])
        //Simuler store
        const store = bills
        //Simuler localStore  vide
        const locaStore = localStorageMock
        
        //Crer un user 
        const userObj = {
          type:"Employee",
          email:"employee@test.tld",
          password:"employee",
          status:"connected"
        }
        
        //Attribuer ce user au localstore 
        locaStore.setItem("user",userObj)

        //----- Suivi du résultat
        console.log("localStorage user :\n ",locaStore.getItem("user"))
        console.log("type of localStorage : ",typeof locaStore.getItem("user"))
        
        console.log("Parse localStorage :\n ",JSON.parse(locaStore.getItem("user")))
        console.log("type of parse localStorage :",typeof JSON.parse(locaStore.getItem("user")))
        
        console.log("parse localStorage email user : ", JSON.parse(locaStore.getItem("user")).email,"\n expected : employee@test.tld")
        console.log("type of localStorage email user :",typeof JSON.parse(locaStore.getItem("user")).email,"\n expected : string")
        
        //Création d'un nouveau NewBill grâce à @document, @onNavigate, @store, @localstore
        const aNewBill = new NewBill({document,onNavigate,store,locaStore})
        
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
        // retourn -1 si erreur 
        expect(aNewBill.handleChangeFile(event)).not().toBe(-1)
      })
    })
  })
})