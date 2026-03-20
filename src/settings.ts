import { App, PluginSettingTab, Setting } from 'obsidian';
import ModularHabitTracker from './main';
import { Habit } from './types';

export class TrackerSettingTab extends PluginSettingTab {
    plugin: ModularHabitTracker;

    constructor(app: App, plugin: ModularHabitTracker) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Modular Habit Tracker Settings' });

        new Setting(containerEl)
            .setName('Daily Notes Folder')
            .setDesc('Where are your daily notes stored?')
            .addText(text => text
                .setPlaceholder('Journal/Daily Notes')
                .setValue(this.plugin.settings.dailyNotesFolder)
                .onChange(async (value) => {
                    this.plugin.settings.dailyNotesFolder = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'Habits Management' });
        
        // Add New Habit Button
        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('+ Add New Habit')
                .setCta()
                .onClick(async () => {
                    const newHabit: Habit = {
                        id: `habit_${Date.now()}`,
                        label: 'New Habit',
                        category: this.plugin.settings.categories[0] ?? 'General',
                        type: 'dua',
                        description: '',
                        frequency: 'daily',
                        status: 'active'
                    };
                    this.plugin.settings.habits.push(newHabit);
                    await this.plugin.saveSettings();
                    this.display(); // Refresh settings UI
                }));

        // List existing habits
        this.plugin.settings.habits.forEach((habit, index) => {
            const habitSetting = new Setting(containerEl)
                .setName(habit.label)
                .setDesc(`${habit.category} | Status: ${habit.status}`);

            // Toggle Sleep Status
            habitSetting.addButton(btn => btn
                .setButtonText(habit.status === 'sleep' ? 'Wake Up' : 'Put to Sleep')
                .onClick(async () => {
                    habit.status = habit.status === 'sleep' ? 'active' : 'sleep';
                    await this.plugin.saveSettings();
                    this.display();
                }));

            // Delete Habit
            habitSetting.addButton(btn => btn
                .setButtonText('Delete')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings.habits.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.display();
                }));
        });
    }
}