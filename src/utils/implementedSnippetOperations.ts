import axios from 'axios';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet';
import { PaginatedUsers } from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";
import { SnippetOperations } from "./snippetOperations.ts";

export class ImplementedSnippetOperations implements SnippetOperations {
    private baseUrl = "https://your-api-endpoint.com/api";
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/snippets`, {
            headers: this.getHeaders(),
            params: {
                page,
                pageSize,
                snippetName
            }
        });
        return response.data; // Axios automatically parses JSON
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        // TODO
        const response = await axios.post(`${this.baseUrl}/snippets`, createSnippet, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/snippets/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        // TODO
        const response = await axios.put(`${this.baseUrl}/snippets/${id}`, updateSnippet, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/users`, {
            headers: this.getHeaders(),
            params: {
                page,
                pageSize,
                name
            }
        });
        return response.data;
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        // TODO
        const response = await axios.post(`${this.baseUrl}/snippets/${snippetId}/share`, { userId }, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getFormatRules(): Promise<Rule[]> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/format-rules`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getLintingRules(): Promise<Rule[]> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/linting-rules`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getTestCases(): Promise<TestCase[]> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/test-cases`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async formatSnippet(snippet: string): Promise<string> {
        // TODO
        const response = await axios.post(`${this.baseUrl}/format`, { snippet }, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        // TODO
        const response = await axios.post(`${this.baseUrl}/test-cases`, testCase, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async removeTestCase(id: string): Promise<string> {
        // TODO
        const response = await axios.delete(`${this.baseUrl}/test-cases/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async deleteSnippet(id: string): Promise<string> {
        // TODO
        const response = await axios.delete(`${this.baseUrl}/snippets/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        // TODO
        const response = await axios.post(`${this.baseUrl}/test-snip`, testCase, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getFileTypes(): Promise<FileType[]> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/file-types`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO
        const response = await axios.put(`${this.baseUrl}/format-rules`, newRules, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO
        const response = await axios.put(`${this.baseUrl}/linting-rules`, newRules, {
            headers: this.getHeaders(),
        });
        return response.data;
    }
}
