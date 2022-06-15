//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(total){
        if(total>0){
            this.percentage = Math.round(this.value / total* 100);
        } else{
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp:[],
            inc:[]
        },

        totals: {
            exp:0,
            inc:0
        },

        budget:0,

        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function(){
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate percentage of income spent
            if(data.totals.inc > 0){
             data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);   
            } else{
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
       
        testing: function(){
            console.log(data)
        }
    };

})();

//Ui Controller
var UIController = (function(){
    //    
    var DOMstrings = {
        inputType: '.add-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputBtn: '.add-btn',
        incomeContainer: '.income-list',
        expensesContainer: '.expenses-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.budget-income-value',
        expensesLabel: '.budget-expenses-value',
        percentageLabel: '.budget-expenses-percentage',
        container: '.container-items',
        expensesPercLabel: '.item-percentage',
        dateLabel: '.budget-title-month'
    };

    var  formatNumber = function(num,type){
        var num, numSplit, int, dec;
/*
        num.parseFloat(num.toFixed(2)).toLocaleString('pt-BR', {
            currency: 'BRL',
            style: 'currency',
            minimumFractionDigits:2
        })

        return num;
*/
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0,int.length - 3) + '.' + int.substr(int.length - 3,int.length);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' :  '+' ) + ' ' + int + ',' + dec ;

    };

    var nodeListForEach = function(list,callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
           
            var html,newHtml,element;
            //Create a HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearflix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearflix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="bx bxs-trash"></i></button></div></div></div>'
            
            }else if (type ==='exp'){      
                element = DOMstrings.expensesContainer;   
                html = '<div class="item clearflix" id="exp-%id%"><div class="item-description">%description%</div><div class="right clearflix"><div class="item-value">%value%</div><div class="item-percentage"></div><div class="item-delete"><button class="item-delete-btn"><i class="bx bxs-trash"></i></button></div></div></div>'
            }
         
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    
        },

        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach((current)=>{
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
              
            nodeListForEach(fields, function(current,index){
                if (percentages[index] > 0){
                current.textContent = percentages[index]+'%';
                }else{
                    current.textContent = '---'
                }
            });
        },

        displayMonth: function(){
            var now, year, month, months;
            months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul' , 'ago', 'set', 'out', 'nov', 'dez']
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + '/' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();

//Global app controller
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();   
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        //Key presss event
        document.addEventListener('keypress', (event)=>{
        if(event.key === 'Enter'){
            ctrlAddItem();
            
        }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }; 

    var updateBudget = function(){
        //1.Calculate the budget
        budgetCtrl.calculateBudget();

        //2.Return the budget
        var budget = budgetCtrl.getBudget();

       //3.Display the budget on the UI
       UICtrl.displayBudget(budget)

    };

    var updatePercentages = function(){
    //1. Calculate the percentages
        budgetCtrl.calculatePercentages();
    //2.Read percentages
        var percentages = budgetCtrl.getPercentages();
    //3. Ipdate the UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;
       //1. Get the field input data
       input = UICtrl.getInput();

       if(input.description !== "" && !isNaN(input.value) && input.value > 0){

       //2. Add the item to the budget controller
       newItem = budgetCtrl.addItem(input.type, input.description, input.value)

       //3.Add the item to the UI
       UICtrl.addListItem(newItem,input.type);

       //4 Clear Fields
       UICtrl.clearFields();

       //5. Calculate and update
        updateBudget();
        }

        //6. Update List Percentages
        updatePercentages();
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //Split 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from the data structure
            budgetCtrl.deleteItem(type,ID);
            //2. Delete from UI
            UICtrl.deleteListItem(itemID);

            //3. Update the budget
            updateBudget();

            //4. Update list Percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            console.log('App started');
            UICtrl.displayMonth()  ;
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            setupEventListeners();
        }
    };
   
})(budgetController, UIController);

controller.init();
