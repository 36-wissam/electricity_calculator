


        const tiers = [
            { min: 1, max: 400, rate: 72, name: "الشريحة الأولى (1-400)" },
            { min: 401, max: 800, rate: 108, name: "الشريحة الثانية (401-800)" },
            { min: 801, max: 1200, rate: 175, name: "الشريحة الثالثة (801-1200)" },
            { min: 1201, max: 1600, rate: 265, name: "الشريحة الرابعة (1201-1600)" },
            { min: 1601, max: 2000, rate: 350, name: "الشريحة الخامسة (1601-2000)" },
            { min: 2001, max: Infinity, rate: 350, name: "الشريحة السادسة (أكثر من 2000)" }
        ];

        const slider = document.getElementById('consumptionSlider');
        const consumptionValue = document.getElementById('consumptionValue');
        const breakdown = document.getElementById('breakdown');
        const totalCostElement = document.getElementById('totalCost');
        const halfMonthToggle = document.getElementById('halfMonthToggle');
        const periodText = document.getElementById('periodText');
        const darkModeToggle = document.getElementById('darkModeToggle');

        let isHalfMonth = false;
        let isDarkMode = localStorage.getItem('darkMode') === 'true';


        if (isDarkMode) {
            document.body.classList.add('dark');
            darkModeToggle.classList.add('active');
        }

        function formatNumber(num) {
            return new Intl.NumberFormat('en-US').format(num);
        }

        function calculateCost(consumption) {
            let totalCost = 0;
            let breakdownData = [];
            let remainingConsumption = consumption;

            for (let tier of tiers) {
                if (remainingConsumption <= 0) break;

                let tierConsumption = 0;
                if (remainingConsumption > 0) {
                    if (tier.max === Infinity) {
                        tierConsumption = remainingConsumption;
                    } else {
                        tierConsumption = Math.min(remainingConsumption, tier.max - tier.min + 1);
                        if (consumption < tier.min) {
                            tierConsumption = 0;
                        } else if (consumption >= tier.min && consumption <= tier.max) {
                            tierConsumption = consumption - tier.min + 1;
                        } else {
                            tierConsumption = tier.max - tier.min + 1;
                        }
                    }
                }

                if (consumption >= tier.min && tierConsumption > 0) {
                    const tierCost = tierConsumption * tier.rate;
                    totalCost += tierCost;
                    
                    breakdownData.push({
                        name: tier.name,
                        consumption: tierConsumption,
                        rate: tier.rate,
                        cost: tierCost
                    });
                }

                remainingConsumption -= tierConsumption;
            }

            return { totalCost, breakdownData };
        }

        function updateCalculation() {
            const consumption = parseInt(slider.value);
            const actualConsumption = isHalfMonth ? consumption / 2 : consumption;
            
            consumptionValue.textContent = `${formatNumber(consumption)} ك.و.س`;
            
            const result = calculateCost(actualConsumption);
            const finalCost = isHalfMonth ? result.totalCost : result.totalCost;
            

            breakdown.innerHTML = '';
            
            result.breakdownData.forEach(item => {
                const div = document.createElement('div');
                div.className = 'breakdown-item';
                div.innerHTML = `
                    <div>
                        <div>${item.name}</div>
                        <div class="tier-info">${formatNumber(item.consumption)} ك.و.س × ${formatNumber(item.rate)} دينار</div>
                    </div>
                    <div class="cost-info">${formatNumber(item.cost)} دينار</div>
                `;
                breakdown.appendChild(div);
            });

            const totalDiv = document.createElement('div');
            totalDiv.className = 'breakdown-item';
            totalDiv.innerHTML = `
                <div><strong>المجموع الإجمالي</strong></div>
                <div class="cost-info"><strong>${formatNumber(finalCost)} دينار عراقي</strong></div>
            `;
            breakdown.appendChild(totalDiv);

            totalCostElement.textContent = `${formatNumber(finalCost)} دينار عراقي`;
            periodText.textContent = isHalfMonth ? 'التكلفة لنصف شهر (15 يوم)' : 'التكلفة الشهرية الإجمالية';
        }

        slider.addEventListener('input', updateCalculation);

        halfMonthToggle.addEventListener('click', function() {
            isHalfMonth = !isHalfMonth;
            this.classList.toggle('active');
            updateCalculation();
        });

        darkModeToggle.addEventListener('click', function() {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark');
            this.classList.toggle('active');
            localStorage.setItem('darkMode', isDarkMode);
        });

        updateCalculation();

