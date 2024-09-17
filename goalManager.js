import { abConfig } from './config.js';

// goalManager.js

export default class GoalManager {
    constructor(config) {
        this.config = config;
        this.goalTypes = ['letter', 'number', 'numberVisual', 'addition', 'additionVisual', 'subtraction', 'subtractionVisual'];
        this.currentGoal = null;
    }

    setNewGoal() {
        const randomType = this.goalTypes[Math.floor(Math.random() * this.goalTypes.length)];
        let value, a, b;

        switch (randomType) {
            case 'letter':
                value = this.getRandomLetter();
                break;
            case 'number':
            case 'numberVisual':
                value = this.getRandomNumber();
                break;
            case 'addition':
            case 'additionVisual':
                a = this.getRandomNumber();
                b = this.getRandomNumber(1, abConfig.numberRange.max - a);
                value = `${a}+${b}`;
                break;
            case 'subtraction':
            case 'subtractionVisual':
                a = this.getRandomNumber(2, abConfig.numberRange.max);
                b = this.getRandomNumber(1, a - 1);
                value = `${a}-${b}`;
                break;
        }

        this.currentGoal = { type: randomType, value: value };
        return this.currentGoal;
    }

    getRandomNumber(min = abConfig.numberRange.min, max = abConfig.numberRange.max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomLetter() {
        const min = abConfig.letterRange.min.charCodeAt(0);
        const max = abConfig.letterRange.max.charCodeAt(0);
        return String.fromCharCode(this.getRandomNumber(min, max));
    }

    checkGoalAchievement(collectedItem) {
        if (this.currentGoal.type === 'letter' && collectedItem.type === 'letter') {
            return collectedItem.value === this.currentGoal.value;
        }
        if (this.currentGoal.type === 'number' && collectedItem.type === 'number') {
            return parseInt(collectedItem.value) === parseInt(this.currentGoal.value);
        }
        if (this.currentGoal.type === 'addition' && collectedItem.type === 'number') {
            const [a, b] = this.currentGoal.value.split('+').map(n => parseInt(n.trim()));
            return parseInt(collectedItem.value) === a + b;
        }
        if (this.currentGoal.type === 'subtraction' && collectedItem.type === 'number') {
            const [a, b] = this.currentGoal.value.split('-').map(n => parseInt(n.trim()));
            return parseInt(collectedItem.value) === a - b;
        }
        if ((this.currentGoal.type === 'numberVisual' || this.currentGoal.type === 'additionVisual' || this.currentGoal.type === 'subtractionVisual') && collectedItem.type === 'item') {
            return true; // Always return true for visual goals, actual check will be done in the game.js
        }
        return false;
    }
}
