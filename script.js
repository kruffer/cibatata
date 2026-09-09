const menu = document.getElementById("menu")

const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")

const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

const paymentMethod = document.getElementById("payment-method")
const paymentWarn = document.getElementById("payment-warn")

const changeContainer = document.getElementById("change-container")
const changeInput = document.getElementById("change")
const changeWarn = document.getElementById("change-warn")

// MODAL DE PERSONALIZAÇÃO

const customizationModal = document.getElementById("customization-modal")
const customizationProductName = document.getElementById("customization-product-name")
const customizationTotal = document.getElementById("customization-total")
const closeCustomizationBtn = document.getElementById("close-customization-btn")
const addCustomizedBtn = document.getElementById("add-customized-btn")
const borderWarn = document.getElementById("border-warn")
const noAdditional = document.getElementById("no-additional")

let cart = []

let currentProduct = null


// ================================
// PAGAMENTO
// ================================

paymentMethod.addEventListener("change", function() {

    paymentWarn.classList.add("hidden")

    if(paymentMethod.value === "Dinheiro") {

        changeContainer.classList.remove("hidden")

    } else {

        changeContainer.classList.add("hidden")
        changeInput.value = ""
        changeWarn.classList.add("hidden")

    }

})


// ================================
// ABRIR CARRINHO
// ================================

cartBtn.addEventListener("click", function() {

    cartModal.style.display = "flex"

    updateCartModal()

})


// ================================
// FECHAR CARRINHO CLICANDO FORA
// ================================

cartModal.addEventListener("click", function(event) {

    if(event.target === cartModal) {

        cartModal.style.display = "none"

    }

})


// ================================
// BOTÃO FECHAR CARRINHO
// ================================

closeModalBtn.addEventListener("click", function() {

    cartModal.style.display = "none"

})


// ================================
// CLIQUE NOS PRODUTOS
// ================================

menu.addEventListener("click", function(event) {

    const parentButton = event.target.closest(".add-to-cart-btn")

    if(!parentButton) {
        return
    }

    const name = parentButton.getAttribute("data-name")
    const price = parseFloat(parentButton.getAttribute("data-price"))
    const type = parentButton.getAttribute("data-type")

    // Se for batata, abre personalização
    if(type === "batata") {

        openCustomizationModal(name, price)

        return
    }

    // Se for bebida, adiciona diretamente
    addToCart(name, price)

})


// ================================
// ABRIR MODAL DE PERSONALIZAÇÃO
// ================================

function openCustomizationModal(name, price) {

    currentProduct = {
        name: name,
        price: price
    }

    customizationProductName.textContent = name

    customizationTotal.textContent = price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })

    // Limpa as opções anteriores

    document.querySelectorAll('input[name="border"]').forEach(function(input) {

        input.checked = false

    })

    document.querySelectorAll(".additional-option").forEach(function(input) {

        input.checked = false

    })

    borderWarn.classList.add("hidden")

    customizationModal.style.display = "flex"

}


// ================================
// FECHAR MODAL DE PERSONALIZAÇÃO
// ================================

closeCustomizationBtn.addEventListener("click", function() {

    customizationModal.style.display = "none"

})


// Fechar clicando fora

customizationModal.addEventListener("click", function(event) {

    if(event.target === customizationModal) {

        customizationModal.style.display = "none"

    }

})


// ================================
// NÃO QUERO ADICIONAL
// ================================

noAdditional.addEventListener("change", function() {

    if(noAdditional.checked) {

        document.querySelectorAll(".additional-option").forEach(function(input) {

            if(input !== noAdditional) {

                input.checked = false

            }

        })

    }

    updateCustomizationTotal()

})


// ================================
// ADICIONAIS
// ================================

document.querySelectorAll(".additional-option").forEach(function(input) {

    input.addEventListener("change", function() {

        if(input !== noAdditional && input.checked) {

            noAdditional.checked = false

        }

        updateCustomizationTotal()

    })

})


// ================================
// ATUALIZAR TOTAL DA PERSONALIZAÇÃO
// ================================

function updateCustomizationTotal() {

    if(!currentProduct) {
        return
    }

    let total = currentProduct.price

    document.querySelectorAll(".additional-option").forEach(function(input) {

        if(input.checked && input !== noAdditional) {

            total += parseFloat(input.getAttribute("data-price"))

        }

    })

    customizationTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })

}


// ================================
// ADICIONAR BATATA PERSONALIZADA
// ================================

addCustomizedBtn.addEventListener("click", function() {

    if(!currentProduct) {
        return
    }

    // Verifica a borda

    const selectedBorder = document.querySelector('input[name="border"]:checked')

    if(!selectedBorder) {

        borderWarn.classList.remove("hidden")

        return

    }

    borderWarn.classList.add("hidden")


    // Pega os adicionais

    const additions = []

    let additionsTotal = 0

    document.querySelectorAll(".additional-option").forEach(function(input) {

        if(
            input.checked &&
            input !== noAdditional
        ) {

            const additionName = input.getAttribute("data-name")
            const additionPrice = parseFloat(input.getAttribute("data-price"))

            additions.push({
                name: additionName,
                price: additionPrice
            })

            additionsTotal += additionPrice

        }

    })


    const finalPrice = currentProduct.price + additionsTotal


    // Cria uma chave para identificar
    // se a configuração é exatamente igual

    const additionsKey = additions
        .map(addition => addition.name)
        .sort()
        .join("|")

    const customizationKey =
        currentProduct.name +
        "|" +
        selectedBorder.value +
        "|" +
        additionsKey


    // Procura se já existe exatamente
    // a mesma configuração

    const existingItem = cart.find(function(item) {

        return item.customizationKey === customizationKey

    })


    if(existingItem) {

        existingItem.quantity += 1

    } else {

        cart.push({

            name: currentProduct.name,

            basePrice: currentProduct.price,

            price: finalPrice,

            quantity: 1,

            border: selectedBorder.value,

            additions: additions,

            customizationKey: customizationKey

        })

    }


    customizationModal.style.display = "none"

    updateCartModal()

})


// ================================
// ADICIONAR BEBIDA
// ================================

function addToCart(name, price) {

    const existingItem = cart.find(function(item) {

        return (
            item.name === name &&
            !item.border &&
            (!item.additions || item.additions.length === 0)
        )

    })


    if(existingItem) {

        existingItem.quantity += 1

    } else {

        cart.push({

            name: name,

            price: price,

            quantity: 1,

            customizationKey: name

        })

    }


    updateCartModal()

}


// ================================
// ATUALIZAR CARRINHO
// ================================

function updateCartModal() {

    cartItemsContainer.innerHTML = ""

    let total = 0


    cart.forEach(function(item, index) {

        const cartItemElement = document.createElement("div")

        cartItemElement.classList.add(
            "flex",
            "justify-between",
            "mb-4",
            "flex-col",
            "border-b",
            "pb-3"
        )


        let customizationHTML = ""


        // Se for uma batata personalizada

        if(item.border) {

            customizationHTML += `
                <p class="text-sm text-gray-600">
                    Borda: ${item.border}
                </p>
            `


            if(item.additions && item.additions.length > 0) {

                customizationHTML += `
                    <p class="text-sm text-gray-600">
                        Adicionais:
                    </p>

                    <ul class="text-sm text-gray-600 ml-4 list-disc">
                `

                item.additions.forEach(function(addition) {

                    customizationHTML += `
                        <li>
                            ${addition.name} — R$ ${addition.price.toFixed(2).replace(".", ",")}
                        </li>
                    `

                })

                customizationHTML += `
                    </ul>
                `

            } else {

                customizationHTML += `
                    <p class="text-sm text-gray-600">
                        Sem adicionais
                    </p>
                `

            }

        }


        cartItemElement.innerHTML = `

            <div class="flex items-center justify-between">

                <div>

                    <p class="font-medium">
                        ${item.name}
                    </p>

                    ${customizationHTML}

                    <p class="mt-1">
                        Qtd: ${item.quantity}
                    </p>

                    <p class="font-medium mt-1">
                        R$ ${item.price.toFixed(2).replace(".", ",")}
                    </p>

                </div>

                <button
                    class="remove-from-cart-btn"
                    data-index="${index}"
                >
                    Remover
                </button>

            </div>

        `


        total += item.price * item.quantity

        cartItemsContainer.appendChild(cartItemElement)

    })


    cartTotal.textContent = total.toLocaleString("pt-BR", {

        style: "currency",

        currency: "BRL"

    })


    // Mostra a quantidade total de produtos

    const totalQuantity = cart.reduce(function(sum, item) {

        return sum + item.quantity

    }, 0)


    cartCounter.textContent = totalQuantity

}


// ================================
// REMOVER ITEM DO CARRINHO
// ================================

cartItemsContainer.addEventListener("click", function(event) {

    if(event.target.classList.contains("remove-from-cart-btn")) {

        const index = parseInt(
            event.target.getAttribute("data-index")
        )

        removeItemCart(index)

    }

})


function removeItemCart(index) {

    if(index < 0 || index >= cart.length) {
        return
    }


    const item = cart[index]


    if(item.quantity > 1) {

        item.quantity -= 1

    } else {

        cart.splice(index, 1)

    }


    updateCartModal()

}


// ================================
// ENDEREÇO
// ================================

addressInput.addEventListener("input", function(event) {

    const inputValue = event.target.value

    if(inputValue !== "") {

        addressInput.classList.remove("border-red-500")

        addressWarn.classList.add("hidden")

    }

})


// ================================
// FINALIZAR PEDIDO
// ================================

checkoutBtn.addEventListener("click", function() {

    const isOpen = checkRestaurantOpen()


    if(!isOpen) {

        alert("RESTAURANTE FECHADO NO MOMENTO!")

        return

    }


    if(cart.length === 0) {
        return
    }


    if(addressInput.value === "") {

        addressWarn.classList.remove("hidden")

        addressInput.classList.add("border-red-500")

        return

    }


    if(paymentMethod.value === "") {

        paymentWarn.classList.remove("hidden")

        return

    }


    if(
        paymentMethod.value === "Dinheiro" &&
        changeInput.value === ""
    ) {

        changeWarn.classList.remove("hidden")

        return

    }


    // ================================
    // MONTAR PEDIDO PARA WHATSAPP
    // ================================

    const cartItems = cart.map(function(item) {

        let itemMessage =
            `- ${item.quantity}x ${item.name} — R$ ${item.price.toFixed(2).replace(".", ",")}`


        // Se tiver borda

        if(item.border) {

            itemMessage += `\n  Borda: ${item.border}`


            if(
                item.additions &&
                item.additions.length > 0
            ) {

                itemMessage += `\n  Adicionais:`

                item.additions.forEach(function(addition) {

                    itemMessage +=
                        `\n  + ${addition.name}`

                })

            } else {

                itemMessage += `\n  Sem adicionais`

            }

        }


        return itemMessage + "\n"

    }).join("\n")


    const total = cart.reduce(function(sum, item) {

        return sum + (item.price * item.quantity)

    }, 0)


    let paymentMessage =
        `PAGAMENTO: ${paymentMethod.value}`


    if(paymentMethod.value === "Dinheiro") {

        paymentMessage +=
            `\nTROCO PARA: R$ ${changeInput.value}`

    }


    const message = encodeURIComponent(

`CIBATATA — NOVO PEDIDO

PEDIDO:

${cartItems}

TOTAL: R$ ${total.toFixed(2).replace(".", ",")}

ENDEREÇO:

${addressInput.value}

${paymentMessage}

Enviado pelo site CIBATATA`

    )


    const phone = "5521970570175"


    window.open(
        `https://wa.me/${phone}?text=${message}`,
        "_blank"
    )

})


// ================================
// VERIFICAR HORÁRIO
// ================================

function checkRestaurantOpen() {

    const data = new Date()

    const hora = data.getHours()

    return hora >= 10 && hora < 22

}


const spanItem = document.getElementById("date-span")

const isOpen = checkRestaurantOpen()


if(isOpen) {

    spanItem.classList.remove("bg-red-500")

    spanItem.classList.add("bg-green-600")

} else {

    spanItem.classList.remove("bg-green-600")

    spanItem.classList.add("bg-red-500")

}