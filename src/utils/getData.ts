import fs from "fs";
import puppeteer from "puppeteer";

let dadosCovid: {
  NumCasos?: number;
  NumMortes?: number;
  IndiceSP?: number;
  IndiceCapital?: number;
  PrimeiraDose?: number;
  SegundaDose?: number;
};

// let parseNumber = (Num: string): Number => {
//   Num.replace(".", "");
//   Num.replace(",", "");
//   return parseInt(Num);
// };

export const getData: any = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.saopaulo.sp.gov.br/coronavirus");

    const dataList = await page.evaluate(() => {
      const nodeList = document.querySelectorAll("p");
      const dataArray = [...nodeList];
      const list = dataArray.map((p) => ({
        text: p.innerText,
      }));

      // console.log(list);

      dadosCovid = {
        NumCasos: parseInt(list[6].text.replace(".", "").replace(".", "")),
        NumMortes: parseInt(list[8].text.replace(".", "").replace(".", "")),
        IndiceSP: parseInt(list[13].text),
        IndiceCapital: parseInt(list[15].text),
      };
      return dadosCovid;
    });

    const page2 = await browser.newPage();
    await page2.goto("https://www.saopaulo.sp.gov.br/");

    const datalist2 = await page2.evaluate(() => {
      const nodeList = document.querySelectorAll("p");

      const dataArray = [...nodeList];

      const list = dataArray.map((p) => ({
        text: p.innerText,
      }));
      console.log("List2");
      console.log(list);
      dadosCovid = {
        PrimeiraDose: parseInt(list[11].text.replace(".", "").replace(".", "")),
        SegundaDose: parseInt(list[13].text.replace(".", "").replace(".", "")),
      };

      return dadosCovid;
    });

    const dados = { ...dataList, ...datalist2 };
    console.log(dados);

    fs.writeFile("./../data.json", JSON.stringify(dados, null, 2), (err) => {
      if (err) throw new Error("Algo deu errado.");
      console.log("File written. Filename: data.json");
    });

    await browser.close();
  } catch (error) {
    if (error) {
      console.log("Erro puppeteer: " + error);
    }
  }
};
