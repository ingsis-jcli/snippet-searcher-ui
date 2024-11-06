import axios from 'axios';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet';
import { PaginatedUsers } from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";
import { SnippetOperations } from "./snippetOperations.ts";

export class ImplementedSnippetOperations implements SnippetOperations {
    private baseUrl: string;
    private token: string;

    constructor(token: string) {
        this.token = token;
        this.baseUrl = `${window.location.origin}/api`;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        const headers = await this.getHeaders();
        const params: { page: number; size: number; owner: boolean; shared: boolean; name?: string } = {
            page,
            size: pageSize,
            owner: false,
            shared: false,
        };

        if (snippetName) {
            params.name = snippetName;
        }

        console.log("Performing request on: " + this.baseUrl + "/snippets/snippet/search");

        const response = await axios.get(`${this.baseUrl}/snippets/snippet/search`, {
            headers,
            params,
        });

        console.log("Headers:", JSON.stringify(headers, null, 2));
        console.log("Params:", JSON.stringify(params, null, 2));

        const snippets = response.data;

        console.log("Snippets:", JSON.stringify(snippets, null, 2));

        return {
            page,
            page_size: pageSize,
            count: snippets.length,
            snippets,
        };
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const versions: Map<string, string> = new Map([
            ["printscript1", "1.0"],
            ["printscript2", "1.1"]
        ]);
        const languages: Map<string, string> = new Map([
            ["printscript1", "printscript"],
            ["printscript2", "printscript"]
        ]);

        const languageKey = createSnippet.language;
        const version = versions.get(languageKey) || "1.0";
        const language = languages.get(languageKey) || "printscript";

        const { language: _, ...payloadWithoutLanguage } = createSnippet;

        const payload = {
            ...payloadWithoutLanguage,
            language,
            version
        };

        const headers = await this.getHeaders();

        const response = await axios.post(`${this.baseUrl}/snippets/snippet`, payload, {
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
        const response = await axios.get(`${this.baseUrl}/permissions/users`, {
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
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/snippets/rules/formatting`, {
            headers
        });
        return response.data;
    }

    async getLintingRules(): Promise<Rule[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/snippets/rules/linting`, {
            headers
        });
        return response.data;
    }

    async getTestCases(): Promise<TestCase[]> {
        // TODO (no se cual es)
        const response = await axios.get(`${this.baseUrl}/snippets/testcase`, {
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
        const defaultTestType = {
            snippetId: testCase.id,
            name: testCase.name,
            input: testCase.input,
            output: testCase.output,
            type: "VALID",
        };
        const headers = await this.getHeaders();
        const response = await axios.post(`${this.baseUrl}/snippets/testcase`, defaultTestType, {
            headers,
        });
        return response.data;
    }


    async removeTestCase(id: string): Promise<string> {
        // TODO no implementado
        const response = await axios.delete(`${this.baseUrl}/snippets/testcase/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async deleteSnippet(id: string): Promise<string> {
        // TODO falta el delete en snippet controller
        const response = await axios.delete(`${this.baseUrl}/snippets/snippet/${id}`, {
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
        console.log("Performing request on: " + this.baseUrl + "/snippets/snippet/filetypes");
        console.log("Headers:", JSON.stringify(this.getHeaders(), null, 2));
        const response = await axios.get(`${this.baseUrl}/snippets/snippet/filetypes`, {
            headers: this.getHeaders(),
        });
        console.log(response.data);
        const fileTypes: FileType[] = Object.values(response.data);
        console.log("FileTypes:", JSON.stringify(fileTypes, null, 2));
        return fileTypes;
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
