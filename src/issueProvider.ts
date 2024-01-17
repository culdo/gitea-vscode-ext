import * as vscode from 'vscode';

import { Issue, IssueItem } from './issue';
import { Config } from './config';
import { Logger } from './logger';
import { giteaApi } from 'gitea-js';

type State = "closed" | "open" | "all"

const config = new Config();
const instanceURL = config.instanceURL.endsWith("/") ? config.instanceURL.slice(0, -1) : config.instanceURL
const api = giteaApi(instanceURL, {
    token: config.token
});
export class IssueProvider implements vscode.TreeDataProvider<IssueItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<IssueItem | undefined | null | void> = new vscode.EventEmitter<IssueItem | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<IssueItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private issueList: IssueItem[] = [];

    constructor(
        private state: State
    ) {
        this.refresh();
    }

    public getTreeItem(element: IssueItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public async getIssuesAsync(): Promise<IssueItem[]> {
        this.issueList = [];

        const issues = [];
        let page = 1;
        while (page < 11) {
            Logger.log(`Retrieve issues. State: ${this.state} - page ${page}`);
            
            const issuesOfPage = (await api.repos.issueListIssues(config.owner, config.repo, { state: this.state, page })).data;
            Logger.log(`${issuesOfPage.length} issues retrieved (state: ${this.state} - page: ${page})`);
            issues.push(...issuesOfPage);
            page++;
            if (issuesOfPage.length < 10) {
                break;
            }
        }

        this.issueList = []
        issues.forEach((issue) => {
            const issueItem = new IssueItem(issue as Issue, vscode.TreeItemCollapsibleState.Collapsed)
            this.issueList.push(issueItem)
            const {
                id, state
            } = issueItem.issue
            Logger.debug('Issue processed', { id, state })
        });

        return this.issueList
    }

    public async refresh(state?: State) {
        if (state) {
            this.state = state
        }
        await this.getIssuesAsync();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: IssueItem): vscode.ProviderResult<any[]> {
        return this.createChildNodes(element, this.issueList);
    }

    private createTreeItemWithIcon(label: string) {
        const treeItem = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None)
        treeItem.iconPath = new vscode.ThemeIcon("circle-outline")
        return treeItem
    }

    private createChildNodes(element: IssueItem | undefined, issueItems: IssueItem[]) {
        for (const issueItem of issueItems) {
            if (element === issueItem) {
                const {
                    assignee, state, user
                } = issueItem.issue
                let childItems: vscode.TreeItem[] = [
                    this.createTreeItemWithIcon('Assignee - ' + assignee.login),
                    this.createTreeItemWithIcon('State - ' + state),
                    this.createTreeItemWithIcon('Creator - ' + user.login),
                ];
                return Promise.resolve(childItems);
            }
        }
        return issueItems;
    }
}

