import axios from 'axios';
import {ComplianceEnum, CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet';
import {PaginatedUsers, User} from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";
import { SnippetOperations } from "./snippetOperations.ts";

interface SnippetResponse {
    id: string;
    name: string;
    content: string;
    language: string;
    version: string;
    extension: string;
    compliance: string;
    author: string;
}

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
        const response = await axios.get(`${this.baseUrl}/snippets/snippet/search`, {
            headers,
            params,
        });
        const snippets = response.data.map((snippet: SnippetResponse) => ({
            id: snippet.id,
            name: snippet.name,
            content: snippet.content,
            language: snippet.language,
            extension: snippet.extension,
            compliance: this.mapProcessStatusToComplianceEnum(snippet.compliance),
            author: snippet.author,
        }));
        console.log("Snippets:", JSON.stringify(snippets, null, 2));
        return {
            page,
            page_size: pageSize,
            count: snippets.length,
            snippets,
        };
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const [language, version] = createSnippet.language.split(":");
        const payload: {name: string; content: string; language: string; version: string; } = {
            name: createSnippet.name,
            content: createSnippet.content,
            language: language,
            version: version,
        };
        console.log("Payload:", JSON.stringify(payload, null, 2));
        console.log("Creating snippet at: " + `${this.baseUrl}/snippets/snippet`);
        const headers = await this.getHeaders();
        const response = await axios.post(`${this.baseUrl}/snippets/snippet`, payload, {
            headers,
        });
        const snippet: Snippet = {
            id: response.data.id,
            name: response.data.name,
            content: response.data.content,
            language: response.data.language,
            extension: response.data.extension,
            compliance: this.mapProcessStatusToComplianceEnum(response.data.compliance),
            author: response.data.author,
        }
        console.log("Snippet created:", JSON.stringify(snippet, null, 2));
        return snippet;
    }


    async getSnippetById(id: string): Promise<Snippet | undefined> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/snippets/snippet`, {
            headers,
            params: {
                snippetId: id,
            },
        });
        const snippet: Snippet = {
            id: response.data.id,
            name: response.data.name,
            content: response.data.content,
            language: response.data.language,
            extension: response.data.extension,
            compliance: this.mapProcessStatusToComplianceEnum(response.data.compliance),
            author: response.data.author,
        }
        console.log("Snippet get:", JSON.stringify(snippet, null, 2));
        return snippet;
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const headers = await this.getHeaders();
        console.log("Performing update at: " + `${this.baseUrl}/snippets/snippet?snippetId=${id}`);
        console.log("Content: " + updateSnippet.content);

        const response = await axios.put(`${this.baseUrl}/snippets/snippet`, updateSnippet.content, {
            headers: {
                ...headers,
                'Content-Type': 'text/plain',
            },
            params: {
                snippetId: id,
            },
        });
        const snippet: Snippet = {
            id: response.data.id,
            name: response.data.name,
            content: response.data.content,
            language: response.data.language,
            extension: response.data.extension,
            compliance: this.mapProcessStatusToComplianceEnum(response.data.compliance),
            author: response.data.author,
        }
        console.log("Snippet edit:", JSON.stringify(snippet, null, 2));
        return snippet;
    }

    async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
        console.log("Fetching users...");
        const response = await axios.get(`${this.baseUrl}/permissions/users`, {
            headers: this.getHeaders(),
            params: {
                page,
                pageSize,
                name
            }
        });

        console.log("Users:", JSON.stringify(response.data, null, 2));
        const users: User[] = response.data.users.map((user: { email: string; id: string }) => ({
            name: user.email,
            id: user.id,
        }));

        const paginatedUsers: PaginatedUsers = {
            page: response.data.page,
            page_size: response.data.pageSize,
            count: response.data.count,
            users,
        };

        console.log("Mapped Users:", JSON.stringify(paginatedUsers, null, 2));
        return paginatedUsers;
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
        // TODO
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
        // TODO
        const response = await axios.delete(`${this.baseUrl}/snippets/snippet/${id}`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        // TODO
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
        const response = await axios.get(`${this.baseUrl}/snippets/snippet/filetypes`, {
            headers: this.getHeaders(),
        });
        const fileTypes: FileType[] = Object.entries(response.data).map(([key, extension]) => {
            return {
                language: key as string,
                extension: extension as string,
            };
        });
        return fileTypes;
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO
        const headers = await this.getHeaders();
        const response = await axios.put(`${this.baseUrl}/snippets/rules/formatting`, newRules, {
            headers,
        });
        return response.data;
    }


    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO
        const headers = await this.getHeaders();
        const response = await axios.put(`${this.baseUrl}/snippets/rules/linting`, newRules, {
            headers,
        });
        return response.data;
    }

    mapProcessStatusToComplianceEnum(status: string): ComplianceEnum {
        switch (status) {
            case 'PENDING':
                return 'pending';
            case 'ERROR':
                return 'failed';
            case 'NON_COMPLIANT':
                return 'not-compliant';
            case 'COMPLIANT':
                return 'compliant';
            default:
                return 'pending';
        }
    }
}
