import { useMutation, UseMutationResult, useQuery } from 'react-query';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet';
import { PaginatedUsers } from './users';
import { TestCase } from '../types/TestCase';
import { FileType } from '../types/FileType';
import { Rule } from '../types/Rule';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { ImplementedSnippetOperations } from './implementedSnippetOperations';

const useToken = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const fetchedToken = await getAccessTokenSilently();
                setToken(fetchedToken);
                localStorage.setItem('authAccessToken', token!);
                console.log("Fetched token:", fetchedToken);
                console.log("Token:", localStorage.getItem('authAccessToken'));
            } catch (error) {
                console.error("Error fetching token:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchToken();
    }, [getAccessTokenSilently]);

    return { token, loading };
};

export const useSnippetsOperations = () => {
    const { token, loading } = useToken();
    const snippetOperations = token ? new ImplementedSnippetOperations(token) : null;
    return { snippetOperations, loading };
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const { snippetOperations, loading } = useSnippetsOperations();

    console.log("Changed version of the token management.")

    return useQuery<PaginatedSnippets, Error>(
        ['listSnippets', page, pageSize, snippetName],
        () => snippetOperations!.listSnippetDescriptors(page, pageSize, snippetName),
        {
            enabled: !loading && !!snippetOperations,
        }
    );
};

export const useGetSnippetById = (id: string) => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<Snippet | undefined, Error>(
        ['snippet', id],
        () => snippetOperations!.getSnippetById(id),
        {
            enabled: !loading && !!snippetOperations && !!id,
        }
    );
};

export const useCreateSnippet = ({ onSuccess }: { onSuccess: () => void }): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<Snippet, Error, CreateSnippet>(
        (createSnippet) => snippetOperations!.createSnippet(createSnippet),
        {
            onSuccess,
        }
    );
};

export const useUpdateSnippetById = ({ onSuccess }: { onSuccess: () => void }): UseMutationResult<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }> => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({ id, updateSnippet }) => snippetOperations!.updateSnippetById(id, updateSnippet),
        {
            onSuccess,
        }
    );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<PaginatedUsers, Error>(
        ['users', name, page, pageSize],
        () => snippetOperations!.getUserFriends(name, page, pageSize),
        {
            enabled: !loading && !!snippetOperations,
        }
    );
};

export const useShareSnippet = () => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({ snippetId, userId }) => snippetOperations!.shareSnippet(snippetId, userId)
    );
};

export const useGetTestCases = (snippetId: string) => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<TestCase[] | undefined, Error>(
        ['testCases', snippetId],
        () => snippetOperations!.getTestCases(snippetId),
        {
            enabled: !loading && !!snippetOperations && !!snippetId,
        }
    );
};

export const usePostTestCase = () => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => snippetOperations!.postTestCase(tc)
    );
};

export const useRemoveTestCase = ({ onSuccess }: { onSuccess: () => void }) => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (id) => snippetOperations!.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export type TestCaseResult = "success" | "fail";

export const useTestSnippet = () => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<TestCaseResult, Error, Partial<TestCase>>(
        (tc) => snippetOperations!.testSnippet(tc)
    );
};

export const useGetFormatRules = () => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<Rule[], Error>(
        'formatRules',
        () => snippetOperations!.getFormatRules(),
        {
            enabled: !loading && !!snippetOperations,
        }
    );
};

export const useModifyFormatRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<Rule[], Error, Rule[]>(
        (rule) => snippetOperations!.modifyFormatRule(rule),
        {
            onSuccess,
        }
    );
};

export const useGetLintingRules = () => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<Rule[], Error>(
        'lintingRules',
        () => snippetOperations!.getLintingRules(),
        {
            enabled: !loading && !!snippetOperations,
        }
    );
};

export const useModifyLintingRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<Rule[], Error, Rule[]>(
        (rule) => snippetOperations!.modifyLintingRule(rule),
        {
            onSuccess,
        }
    );
};

export const useFormatSnippet = () => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (snippetContent) => snippetOperations!.formatSnippet(snippetContent)
    );
};

export const useDeleteSnippet = ({ onSuccess }: { onSuccess: () => void }) => {
    const { snippetOperations } = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (id) => snippetOperations!.deleteSnippet(id),
        {
            onSuccess,
        }
    );
};

export const useGetFileTypes = () => {
    const { snippetOperations, loading } = useSnippetsOperations();

    return useQuery<FileType[], Error>(
        'fileTypes',
        () => snippetOperations!.getFileTypes(),
        {
            enabled: !loading && !!snippetOperations,
        }
    );
};
