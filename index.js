import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { getDatabase,
    ref,
    push,
    onValue,
    remove,
 } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://{your-firebase-project-ID}.{firebase-region}.firebasedatabase.app/"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const referenceInDB = ref(database, "recipes")

const newRecipeButton = document.getElementById("new--recipe")
const recipeForm = document.getElementById("recipe--form")
const ingredientItems = document.getElementById("ingredient--items")
const addIngredientButton = document.getElementById("add--ingredient")
const addCookingStepButton = document.getElementById("add--step")
const cookingSteps = document.getElementById("cooking--steps")
const recipeCardsSection = document.getElementById("recipe-card-container")
const recipeTitleField = document.getElementById("recipe--title--input")
const form = document.getElementById("form")

newRecipeButton.addEventListener("click", newRecipe)
addIngredientButton.addEventListener("click", addIngredient)
addCookingStepButton.addEventListener("click", addCookingStep)
form.addEventListener("submit", formSubmit)

//Add a new recipe to the vault
function newRecipe(){
    recipeForm.classList.toggle("hidden")
    if(recipeForm.classList.contains("hidden")) {
        newRecipeButton.innerHTML = `<i class="fa-solid fa-plus"></i>`
    } else {
        newRecipeButton.innerHTML = `<i class="fa-solid fa-x"></i>`
    }
}

let ingredientCounter = 2

//Ingredient list
function addIngredient(event){
    event.preventDefault()
    
    const newItem = document.createElement("div")
    newItem.classList.add(".item")

    newItem.innerHTML = `
        <div class="item">
            <input 
            class="qty" 
            type="text" 
            placeholder="3" 
            name="ingredient-${ingredientCounter}-quantity"
            >
            &nbsp;&nbsp;
            <input 
            class="name" 
            type="text" 
            placeholder="Peeled Potatos" 
            name="ingredient-${ingredientCounter}-name"
            >
        </div>
    `  
    ingredientItems.appendChild(newItem)
    ingredientCounter++
}

//Cooking methods list    
function addCookingStep(event){
    event.preventDefault()
    
    const newItem = document.createElement("div")
    newItem.classList.add(".item")
    
    newItem.innerHTML = `
        <div class="item">
            <input class="step" type="text" placeholder="Cook the peeled potatoes in a microwave for 5 minutes." name="cooking-steps">
        </div>
    `  
    cookingSteps.appendChild(newItem)
}

//Submit the form, and record the recipe data    
function formSubmit(event){
    event.preventDefault()

    if(!form.checkValidity()) {
        return
    }

    const recipeTitle = recipeTitleField.value.trim()
    
    const ingredientElements = ingredientItems.querySelectorAll(".item")
    const ingredients = {}
    ingredientElements.forEach((element, index) => {
        const qty = element.querySelector(".qty").value.trim()
        const name = element.querySelector(".name").value.trim()
        if(qty && name){
            ingredients[`ingredientID${index+1}`] = {
                qunatity: qty,
                name: name,
            }
        }
    })
    
    const stepElements = cookingSteps.querySelectorAll(".item")
    const cookingMethod = {}
    stepElements.forEach((element, index) => {
        const step = element.querySelector(".step").value.trim()
        if(step){
            cookingMethod[`stepID${index+1}`] = step
        }
    })
    
    const selectedCategory = document.getElementById("category--options").value
    const categories = {
        breakfast: selectedCategory === "breakfast",
        lunch: selectedCategory === "lunch",
        dinner: selectedCategory === "dinner",
        dessert: selectedCategory === "dessert",
    }
    
    const recipeData = {
        title: recipeTitle,
        ingredients: ingredients,
        cookingMethod: cookingMethod,
        categories: categories,
    }
    
    push(referenceInDB, recipeData)
        .then(() => {
            alert("Recipe added successfully!")
            
            recipeTitleField.value = ""
            
            ingredientItems.innerHTML = `
                <div class="item">  
                    <input class="qty" type="text" placeholder="3" id="ingredient--quantity--input">
                    &nbsp;&nbsp;
                    <input class="name" type="text" placeholder="Peeled Potatoes" id="ingredient--input">
                </div>`
                
            cookingSteps.innerHTML = `
                <div class="item"> 
                    <input class="step" type="text" placeholder="Cook the peeled potatos in a microwave for 5 minutes.">
                </div>`
        }).catch((error) => {
            alert("Error adding recipe: " + error.message);
        });
}

// Create the recipe card HTML
function createRecipeCard(recipe, id) {
    const ingredientList = Object.values(recipe.ingredients)
        .map((ing) => `<li>${ing.qunatity} ${ing.name}</li>`)
        .join("");
    const cookingSteps = Object.values(recipe.cookingMethod)
        .map((step) => `<li>${step}</li>`)
        .join("");

    return `
        <div class="recipe--card collapsed" data-id="${id}">
            <div class="recipe--header">
                <h3>${recipe.title}</h3>
                <div class="action-buttons-conatiner">
                    <button class="delete-recipe">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <button class="resize-recipe-card">
                        <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                    </button>
                </div>
            </div>
            <div class="recipe--body">
                <div class="recipe--ingredients">
                    <h4>Ingredients</h4>
                    <ul class="ingredients-list">${ingredientList}</ul>
                </div>
                <div class="recipe--instructions">
                    <h4>Cooking Method</h4>
                    <ul class="instructions-list">${cookingSteps}</ul>
                </div>
            </div>
        </div>
    `;
}

// Handle recipe card resizing
function handleResizeRecipeCard() {
    const resizeRecipeCardButtons = document.querySelectorAll(".resize-recipe-card");

    resizeRecipeCardButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const recipeCardLayout = button.closest(".recipe--card");
            recipeCardLayout.classList.toggle("collapsed");

            const isCollapsed = recipeCardLayout.classList.contains("collapsed");
            button.innerHTML = isCollapsed 
                ? `<i class="fa-solid fa-up-right-and-down-left-from-center"></i>` 
                : `<i class="fa-solid fa-down-left-and-up-right-to-center"></i>`;
        });
    });
}

// Handle delete recipe functionality
function handleDeleteRecipe() {
    document.querySelectorAll(".delete-recipe").forEach((button) => {
        button.addEventListener("click", function () {
            const recipeCard = button.closest(".recipe--card");
            const recipeId = recipeCard.getAttribute("data-id");

            // Replace trash icon with 'Delete Recipe?' button
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Delete Recipe?";
            confirmButton.classList.add("confirm-delete");
            confirmButton.setAttribute("data-id", recipeId); // Carry recipeId as a data attribute
            button.replaceWith(confirmButton);

            // Add event listener to the 'Delete Recipe?' button
            confirmButton.addEventListener("click", function () {
                const recipeIdToDelete = confirmButton.getAttribute("data-id");

                // Remove from Firebase
                remove(ref(database, `recipes/${recipeIdToDelete}`))
                    .then(() => {
                        // Remove from DOM
                        recipeCard.remove();
                        alert("Recipe deleted successfully!");
                    })
                    .catch((error) => {
                        alert("Error deleting recipe: " + error.message);
                    });
            });

            // Add a timeout to revert back to the trash icon if no action is taken
            setTimeout(() => {
                if (document.body.contains(confirmButton)) {
                    confirmButton.replaceWith(button);
                }
            }, 5000); // 5 seconds
        });
    });
}

// Render the saved recipes
function displayRecipes(recipes) {
    recipeCardsSection.innerHTML = `<h2>My Recipes</h2>`;
    for (const id in recipes) {
        const recipe = recipes[id];
        const recipeCard = createRecipeCard(recipe, id);
        recipeCardsSection.innerHTML += recipeCard;
    }

    handleResizeRecipeCard();
    handleDeleteRecipe();
}

onValue(referenceInDB, (snapshot) => {
    const recipes = snapshot.val() || {}
    displayRecipes(recipes)
})
