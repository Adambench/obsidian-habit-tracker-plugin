import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import ModularHabitTracker from './src/main';

export const TRACKER_VIEW_TYPE = 'habit-tracker-view';

export class TrackerView extends ItemView {
    plugin: ModularHabitTracker;
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: ModularHabitTracker) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return TRACKER_VIEW_TYPE;
    }

    getDisplayText() {
        return 'Habit Tracker';
    }

    async onOpen() {
        const container = this.containerEl.children[1] as HTMLElement | undefined;
        if (!container) {
            return;
        }

        container.empty();

        // Mount React
        this.root = createRoot(container);
        this.renderReact();

        // Listen for settings updates to re-render
        this.registerEvent(
            (this.plugin.app.workspace as any).on('habit-tracker:settings-updated', () => {
                this.renderReact();
            })
        );
    }

    renderReact() {
        if (this.root) {
            this.root.render(
                <HabitApp plugin={this.plugin} />
            );
        }
    }

    async onClose() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

// --- REACT APP COMPONENT ---
// This is an adapted version of your provided code.

function HabitApp({ plugin }: { plugin: ModularHabitTracker }) {
    const [selectedDateStr, setSelectedDateStr] = React.useState(
        window.moment().format('YYYY-MM-DD')
    );

    // Filter out sleeping/deprecated habits
    const activeHabits = plugin.settings.habits.filter(h => h.status === 'active');

    const updateHabit = async (dateStr: string, habitId: string) => {
        const { app } = plugin;
        const filePath = `${plugin.settings.dailyNotesFolder}/${dateStr}.md`;
        let file = app.vault.getAbstractFileByPath(filePath) as TFile;

        if (!file) {
            // Create file if it doesn't exist
            file = await app.vault.create(filePath, "---\nhabits:\n---\n");
        }

        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            if (!frontmatter.habits) frontmatter.habits = {};
            frontmatter.habits[habitId] = !frontmatter.habits[habitId];
        });
        
        // Force React re-render by updating state slightly or relying on Obsidian metadata cache events
        setSelectedDateStr(dateStr); 
    };

    return (
        <div className="habit-tracker-container">
            <h2>{selectedDateStr}</h2>
            {plugin.settings.categories.map(category => {
                const categoryHabits = activeHabits.filter(h => h.category === category);
                if (categoryHabits.length === 0) return null;

                return (
                    <div key={category}>
                        <h3>{category}</h3>
                        {categoryHabits.map(habit => (
                            <div 
                                key={habit.id} 
                                onClick={() => updateHabit(selectedDateStr, habit.id)}
                                style={{
                                    padding: '10px', 
                                    margin: '5px 0', 
                                    border: '1px solid gray', 
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                <strong>{habit.label}</strong> - <em>{habit.description}</em>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}