//  Budget Controller

var budgetController = (function () {

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return (this.percentage);
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (ele) {
            sum += ele.value;
        });
        data.totals[type] = sum;
    };

    var data = {

        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: 0

    };

    return {

        addItem: function (type, des, val) {
            var ID, newObj;

            //Creating new Id
            if (data.allItems[type].length > 0) {
                ID = (data.allItems[type][data.allItems[type].length - 1].id) + 1;
            } else {
                ID = 0;
            }

            //Creating new Item based on type is income or expense
            if (type === "expense") {
                newObj = new Expense(ID, des, val);

            } else if (type === "income") {
                newObj = new Income(ID, des, val);
            }

            //Pushing the new item to the data structure
            data.allItems[type].push(newObj);

            //Returning new item  
            return newObj;

        },

        calculateBudget: function () {

            //1. Calculate the total income and expense
            calculateTotal('income');
            calculateTotal('expense');

            //2. Calculate the budget : income - expense
            data.budget = data.totals.income - data.totals.expense;

            //3. Caluclate the percentage of income we spent
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            data.allItems.expense.forEach(function (current) {
                current.calcPercentage(data.totals.income);
            });
        },

        getBudget: function () {
            return {
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                budget: data.budget,
                percentage: data.percentage
            };
        },

        getPercentages: function () {
            var allPercentages = data.allItems.expense.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        }

    };


})();






//  UI Controller

var UIController = (function () {

    var DOMStrings = {

        addInputType: '.add__type',
        addInputDescription: '.add__description',
        addInputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: ".expenses__list",
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expenseItemPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumbers = function (num, type) {
        var splitNum, int, dec;
        /*
        + or - before the number
        exactly 2 decimal points
        comma separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');

        int = splitNum[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = splitNum[1];

        return (((type === 'income') ? '+' : '-') + ' ' + int + '.' + dec);

    };

    var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };

    return {

        getInput: function () {
            return {
                inputType: document.querySelector(DOMStrings.addInputType).value, // Value is income or expense
                inputDescription: document.querySelector(DOMStrings.addInputDescription).value,
                inputValue: parseFloat(document.querySelector(DOMStrings.addInputValue).value)
            };
        },

        addNewItem: function (obj, type) {
            var html, element, newHtml;

            //Create new HTML string with the placeholder text
            if (type === "income") {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));
            newHtml = newHtml.replace('%description%', obj.description);

            //Add the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectedID) {
            var el = document.getElementById(selectedID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.addInputDescription + ", " + DOMStrings.addInputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (element, index, array) {
                element.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            if (obj.budget > 0) {
                type = 'income';
            } else {
                type = 'expense';
            }
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc, 'income');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumbers(obj.totalExp, 'expense');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            };
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expenseItemPercentageLabel);

            /*          var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
*/
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },

        displayDate: function () {
            var date, month, months, year;

            date = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = date.getMonth();

            year = date.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(DOMStrings.addInputDescription + ', ' + DOMStrings.addInputValue + ', ' + DOMStrings.addInputType);

            nodeListForEach(fields, function (current, index) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.addBtn).classList.toggle('red');

        },

        getDOMStrings: function () {
            return DOMStrings;
        }

    };

})();






//  Global App Controller

var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListener = function () {

        var DOMString = UICtrl.getDOMStrings();

        document.querySelector(DOMString.addBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOMString.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMString.addInputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function () {

        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();

        // 2. Return the Budget 
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {

        // 1. Calculate the percentages.
        budgetCtrl.calculatePercentages();

        // 2. Read the percentage from the budgetController
        var percentages = budgetCtrl.getPercentages();

        // 3. Display and Update the percentages to the UI
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function () {
        var inputBtn, newItem;

        // 1. Read the input filed data.
        inputBtn = UICtrl.getInput();

        if (inputBtn.inputDescription !== "" && inputBtn.inputValue > 0 && !isNaN(inputBtn.inputValue)) {

            // 2. Add the input to the budget controller.
            newItem = budgetCtrl.addItem(inputBtn.inputType, inputBtn.inputDescription, inputBtn.inputValue);

            // 3. Add the data to the UI
            UICtrl.addNewItem(newItem, inputBtn.inputType);

            // 4.Clear the input fields
            UICtrl.clearFields();

            // 5.Calculate and Update the budget
            updateBudget();

            // 6.Calculate and Update the percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitId, type, id;

        itemID = event.target.parentElement.parentElement.parentElement.parentElement.id;

        if (itemID) {
            splitID = itemID.split('-');

            type = splitID[0];
            id = parseInt(splitID[1]);

            // 1.Delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            // 2.Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3.Update and show the new budget
            updateBudget();

            // 4.Calculate and Update the percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("Application is working.");
            UICtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: 0
            });
            setUpEventListener();
            UICtrl.displayDate();
        }
    };

})(budgetController, UIController);

//Calling the init function in public
controller.init();
