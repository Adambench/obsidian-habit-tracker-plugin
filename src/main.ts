import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TrackerSettings, DEFAULT_SETTINGS } from './types';
import { TrackerSettingTab } from './settings';
import { TRACKER_VIEW_TYPE, TrackerView } from '../TrackerView';

export default class ModularHabitTracker extends Plugin {
    settings: TrackerSettings;

    async onload() {
        await this.loadSettings();

        // Register the custom view
        this.registerView(
            TRACKER_VIEW_TYPE,
            (leaf) => new TrackerView(leaf, this)
        );

        // Add a ribbon icon to open the tracker
        this.addRibbonIcon('calendar-check', 'Open Habit Tracker', () => {
            this.activateView();
        });

        // Add settings tab
        this.addSettingTab(new TrackerSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Trigger an event so the React view knows to update
        this.app.workspace.trigger('habit-tracker:settings-updated');
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(TRACKER_VIEW_TYPE)[0];

        if (!leaf) {
            const rightLeaf = workspace.getRightLeaf(false);
            if (!rightLeaf) {
                return;
            }
            leaf = rightLeaf;
            await rightLeaf.setViewState({ type: TRACKER_VIEW_TYPE, active: true });
        }

        workspace.revealLeaf(leaf);
    }
}