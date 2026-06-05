import { initializeELements,handleInput } from "./utils.js";

let cityDropdown;

const input = document.querySelector("#input");
const searchForm = document.querySelector(".search-form");


async function init() {
    initializeELements({
        input: input,
        searchForm: searchForm,
        cityDropdown: cityDropdown
    });

    input.addEventListener("input",async (event) => {
        await handleInput(event.target.value);
    });
}

await init();


