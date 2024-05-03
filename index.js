const puppeteer = require("puppeteer")
const fs = require("fs")

const url =
  "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31240404641376006843650660001385901440978735|2|1|1|E44EF878DBCE1C069794C055395F2D91AABB2D89"

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  //await page.screenshot({ path: "exemple.png" }) // tira um print da tela da página

  const note = await page.evaluate(() => {
    const nameMarket = document.querySelector(
      ".container thead tr:nth-child(2) h4 b"
    )

    const dataAddressMarket = document.querySelector(
      ".container tbody tr:nth-child(2) td"
    )
    const conversion = dataAddressMarket.innerHTML.split(",")
    const cepAndCity = conversion[3]
    const separateCepAndCity = cepAndCity.split("-")

    const addressMarket = {
      road: conversion[0],
      number: conversion[1],
      bairro: conversion[2],
      cep: separateCepAndCity[0],
      city: separateCepAndCity[1],
      state: conversion[4],
    }

    const dataItemsRows = document.querySelectorAll("#myTable tr")

    const listItems = []

    dataItemsRows.forEach((item) => {
      const cells = item.querySelectorAll("td")

      if (cells.length === 4) {
        const nameProduct = cells[0].querySelector("h7").textContent.trim()
        const amountProduct = cells[1].textContent.trim().split(": ")[1]
        const unit = cells[2].textContent.trim().split(": ")[1]
        const value = parseFloat(
          cells[3].textContent.trim().split("R$ ")[1].replace(",", ".")
        )
        listItems.push({ nameProduct, amountProduct, unit, value })
      }
    })

    const totalItems = document.querySelector(
      ".container div:nth-child(3) .col-lg-2 strong"
    )

    const totalValue = document.querySelector(
      ".container div:nth-child(8) .col-lg-2 strong"
    )

    const keyNote = document.querySelector(
      ".container #accordion div:nth-child(2) #collapseTwo td"
    )

    const dateAndHour = document.querySelector(
      ".container #accordion div:nth-child(4) #collapse4 table:nth-child(8) tbody td:nth-child(4)"
    )

    const dateAndHourTrim = dateAndHour.innerHTML.split(" ")
    const date = dateAndHourTrim[0]
    const hour = dateAndHourTrim[1]

    const data = {
      nameMarket: nameMarket.innerHTML,
      addressMarket,
      keyNote: keyNote.innerHTML,
      date,
      hour,
      totalItems: totalItems.innerHTML,
      totalValue: totalValue.innerHTML,
      listItems,
    }

    return data
  })

  fs.writeFile("data.json", JSON.stringify(note, null, 2), (err) => {
    if (err) throw new Error("Something went wrong")

    console.log("well done!")
  })
  await browser.close()

  return note
})()
