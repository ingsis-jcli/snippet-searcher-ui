import axios from 'axios';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet';
import { PaginatedUsers } from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";
import { SnippetOperations } from "./snippetOperations.ts";

export class ImplementedSnippetOperations implements SnippetOperations {
    private baseUrl = "https://localhost:8080/api";
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
        const headers = await this.getHeaders();
        console.log("page" + page + "pageSize" + pageSize + "snippetName" + snippetName);
        const response = await axios.get(`${this.baseUrl}/snippets/snippet/search`, {
            headers,
            params: {
                owner: false,
                shared: false,
            }
        });
        console.log(response.data);
        return response.data;
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const headers = await this.getHeaders();

        const response = await axios.post(`${this.baseUrl}/snippets/snippet`, createSnippet, {
            headers,
        });
        return response.data;
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        const headers = await this.getHeaders();

        const response = await axios.get(`${this.baseUrl}/snippets/snippet`, {
            headers,
            params: {
                snippetId: id,
            },
        });
        return response.data;
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const headers = await this.getHeaders();

        const response = await axios.put(`${this.baseUrl}/snippets/snippet`, updateSnippet, {
            headers,
            params: {
                snippetId: id,
            },
        });
        return response.data;
    }

    async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
        //TODO (ver tema paginado)
        const response = await axios.get(`${this.baseUrl}/permissions/friends`, {
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
        // TODO (ver tema email)
        const response = await axios.post(`${this.baseUrl}/snippets/${snippetId}/share`, {userId}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async getFormatRules(): Promise<Rule[]> {
        const version = "1.1";
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/printscript/formatting_rules`, {
            headers,
            params: {
                version,
            },
        });
        return response.data;
    }

    async getLintingRules(): Promise<Rule[]> {
        const version = "1.1";
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/printscript/linting_rules`, {
            headers,
            params: {
                version,
            },
        });
        return response.data;
    }

    async getTestCases(): Promise<TestCase[]> {
        // TODO (no se cual es)
        const response = await axios.get(`${this.baseUrl}/test-cases`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async formatSnippet(snippet: string): Promise<string> {
        // TODO (te paso el codigo y el token)
        const response = await axios.post(`${this.baseUrl}/printscript/format`, {snippet}, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        //TODO sacar type o ver como manejarlo del dto
        const headers = await this.getHeaders();

        const response = await axios.post(`${this.baseUrl}/snippets/test-case`, testCase, {
            headers,
        });

        return response.data;
    }

    async removeTestCase(id: string): Promise<string> {
        // TODO no implementado
        const response = await axios.delete(`${this.baseUrl}/test-cases/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async deleteSnippet(id: string): Promise<string> {
        // TODO falta el delete en snippet controller
        const response = await axios.delete(`${this.baseUrl}/snippets/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        const headers = await this.getHeaders();

        const testCaseRequest = {
            snippetName: testCase.name,
            url: "",
            input: testCase.input ?? [],
            output: testCase.output ?? [],
            version: "1.1"
        };

        const response = await axios.post(`${this.baseUrl}/printscript/test`, testCaseRequest, {
            headers,
        });

        return response.data as TestCaseResult;
    }

    async getFileTypes(): Promise<FileType[]> {
        // TODO
        const response = await axios.get(`${this.baseUrl}/file-types`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        const headers = await this.getHeaders();

        const response = await axios.put(`${this.baseUrl}/snippets/rules/formatting`, newRules, {
            headers,
        });

        return response.data;
    }


    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        const headers = await this.getHeaders();

        const response = await axios.put(`${this.baseUrl}/snippets/rules/linting`, newRules, {
            headers,
        });

        return response.data;
    }
}
