import axios, {AxiosError} from 'axios';
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
            owner: true,
            shared: true,
        };

        if (snippetName) {
            params.name = snippetName;
        }

        const response = await axios.get(`${this.baseUrl}/snippets/snippet/search`, {
            headers,
            params,
        });

        const snippets = Array.isArray(response.data.snippets) ? response.data.snippets.map((snippet: SnippetResponse) => ({
            id: snippet.id,
            name: snippet.name,
            content: snippet.content,
            language: snippet.language,
            extension: snippet.extension,
            compliance: this.mapProcessStatusToComplianceEnum(snippet.compliance),
            author: snippet.author,
        })) : [];

        console.log("Snippets with pagination " , snippets)

        return {
            page,
            page_size: pageSize,
            count: response.data.count,
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

        const headers = await this.getHeaders();

        try {
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
            return snippet;
        } catch (_) {
            alert("Failed to create snippet")
            throw Error("Failed to create snippet")
        }
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
        return snippet;
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const headers = await this.getHeaders();
        try {
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
            return snippet;
        }
        catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>;
        const errorMessage = axiosError.response?.data?.message || "Failed to edit snippet";
        alert(errorMessage);
        throw new Error(errorMessage);
    }
    }

    async getUserFriends(name: string = '', page: number = 0, pageSize: number = 10): Promise<PaginatedUsers> {
        const params = { page, pageSize, name };

        try {
            const { data } = await axios.get(`${this.baseUrl}/permissions/users`, {
                headers: this.getHeaders(),
                params,
            });

            const { page: responsePage, pageSize: responsePageSize, count, users = [] } = data;

            const mappedUsers: User[] = users.map(({ id, email }: { id: string; email: string }) => ({
                id,
                name: email,
            }));

            return {
                page: responsePage,
                page_size: responsePageSize,
                count,
                users: mappedUsers,
            };

        } catch (error) {
            console.error('Error fetching user friends:', error);
            return {
                page: 0,
                page_size: 0,
                count: 0,
                users: [],
            };
        }
    }


    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        try {
            const  response = await axios.post(`${this.baseUrl}/permissions/permissions/share`, null, {
                headers: this.getHeaders(),
                params: {
                    snippetId: snippetId,
                    friendId: userId,
                },
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to share snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async getFormatRules(): Promise<Rule[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/snippets/rules/formatting`, {
            headers
        });
        return response.data.map((rule: { id: string; name: string; value: string | null; numericValue: number | null; isActive: boolean }) => ({
            id: rule.id,
            name: rule.name,
            isActive: rule.isActive,
            value: rule.numericValue,
        }));
    }

    async getLintingRules(): Promise<Rule[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${this.baseUrl}/snippets/rules/linting`, {
            headers
        });
        return response.data;
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseUrl}/snippets/testcase/${snippetId}`, {
                headers
            });
            return response.data;
    }

    async formatSnippet(snippetId: string): Promise<string> {
        const headers = await this.getHeaders();
        try {
            const response = await axios.get(`${this.baseUrl}/snippets/snippet/format/${snippetId}`, {
                headers
            });
            return response.data;
        }
        catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to format snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        const defaultTestType = {
            name: testCase.name,
            snippetId: testCase.snippetId,
            input: testCase.input ?? [],
            output: testCase.output ?? [],
            type: "VALID",
        };

        const headers = await this.getHeaders();
        try {
            const response = await axios.post(`${this.baseUrl}/snippets/testcase`, defaultTestType, {
                headers,
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to post test case for snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }

    }


    async removeTestCase(id: string): Promise<string> {
        try {
            const response = await axios.delete(`${this.baseUrl}/snippets/testcase/${id}`, {
                headers: this.getHeaders(),
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to remove test case for snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            const response = await axios.delete(`${this.baseUrl}/snippets/snippet/${id}`, {
                headers: this.getHeaders(),
            });
            return response.data;
        }  catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to delete snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async testSnippet(id: string): Promise<TestCaseResult> {
        const headers = await this.getHeaders();
        try {
            const response = await axios.get(`${this.baseUrl}/snippets/testcase/run/${id}`, {
                headers,
            });
            return this.mapTestResultToCorresponding(response.data);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponseData>;
            const errorMessage = axiosError.response?.data?.message || "Failed to run test case on snippet";
            alert(errorMessage);
            throw new Error(errorMessage);
        }

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
        const headers = await this.getHeaders();

        const formattedRules = newRules.map(rule => ({
            id: rule.id,
            name: rule.name,
            isActive: rule.isActive,
            numericValue: typeof rule.value === 'number' ? rule.value : null,
            value: typeof rule.value === 'string' ? rule.value : null
        }));

        const response = await axios.put(`${this.baseUrl}/snippets/rules/formatting`, formattedRules, {
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

    mapTestResultToCorresponding(status: string): TestCaseResult {
        switch (status) {
            case 'SUCCESS':
                return 'success';
            case 'FAILURE':
                return 'fail';
            default:
                return 'fail';
        }
    }
}

interface ErrorResponseData {
    message?: string;
}
