import { abConfig } from './config.js';

// goalManager.js

export default class GoalManager {
    constructor(config) {
        this.config = config;
        this.goalTypes = ['letter', 'number', 'numberVisual', 'addition', 'additionVisual', 'subtraction', 'subtractionVisual'];
        this.currentGoal = null;
        this.currentDifficulty = 1;
    }

    setNewGoal(availableGoals, difficulty) {
        this.currentDifficulty = difficulty;
        const randomType = availableGoals[Math.floor(Math.random() * availableGoals.length)];
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
                b = this.getRandomNumber(1, this.getMaxNumber() - a);
                value = `${a}+${b}`;
                break;
            case 'subtraction':
            case 'subtractionVisual':
                a = this.getRandomNumber(2, this.getMaxNumber());
                b = this.getRandomNumber(1, a - 1);
                value = `${a}-${b}`;
                break;
        }

        this.currentGoal = { type: randomType, value: value };
        return this.currentGoal;
    }

    getRandomNumber(min = this.getMinNumber(), max = this.getMaxNumber()) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomLetter() {
        const letters = abConfig.letterDifficulty[this.currentDifficulty];
        return letters[Math.floor(Math.random() * letters.length)];
    }

    getMinNumber() {
        return abConfig.numberDifficulty[this.currentDifficulty].min;
    }

    getMaxNumber() {
        return abConfig.numberDifficulty[this.currentDifficulty].max;
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
