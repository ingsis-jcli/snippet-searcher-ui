import {
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import {AddSnippetModal} from "./AddSnippetModal.tsx";
import {useRef, useState} from "react";
import {Add, Search} from "@mui/icons-material";
import {LoadingSnippetRow, SnippetRow} from "./SnippetRow.tsx";
import {CreateSnippetWithLang, getFileLanguage, Snippet} from "../../utils/snippet.ts";
import {usePaginationContext} from "../../contexts/paginationContext.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useGetFileTypes} from "../../utils/queries.tsx";
import {GetTokenSilentlyOptions, useAuth0} from "@auth0/auth0-react";

type SnippetTableProps = {
  handleClickSnippet: (id: string) => void;
  snippets?: Snippet[];
  loading: boolean;
  handleSearchSnippet: (snippetName: string) => void;
}

export const SnippetTable = (props: SnippetTableProps) => {
  const {snippets, handleClickSnippet, loading,handleSearchSnippet} = props;
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [popoverMenuOpened, setPopoverMenuOpened] = useState(false)
  const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>()

  const popoverRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {page, page_size: pageSize, count, handleChangePageSize, handleGoToPage} = usePaginationContext()
  const {createSnackbar} = useSnackbarContext()
  const {data: fileTypes} = useGetFileTypes();
  const { getAccessTokenSilently } = useAuth0();
    // Función para obtener y verificar el token
    const fetchHelloFromPermissions = async () => {
        try {
            // Obtener el token con cache desactivado para asegurar una autenticación fresca
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: "snippet-searcher",
                    scope: "read:snippets write:snippets",
                },
                cacheMode: "off",
            } as GetTokenSilentlyOptions);

            // Verificar si el token está disponible
            if (!token) {
                console.error("Token no obtenido");
                return;
            }

            console.log("Token obtenido:", token); // Muestra el token para confirmar

            // Realizar el request usando el token obtenido
            const response = await fetch("http://localhost:8080/api/permissions/hello", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Mostrar el status y el mensaje en caso de error
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.text();
            console.log("Respuesta desde permissions service:", data);
        } catch (error) {
            console.error("Error fetching desde permissions service:", error);
        }
    };

    const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files
    if (!files || !files.length) {
      createSnackbar('error',"Please select at leat one file")
      return
    }
    const file = files[0]
    const splitName = file.name.split(".")
    const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1))
    if (!fileType) {
      createSnackbar('error', `File type ${splitName.at(-1)} not supported`)
      return
    }
    file.text().then((text) => {
      setSnippet({
        name: splitName[0],
        content: text,
        language: fileType.language,
        extension: fileType.extension
      })
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      setAddModalOpened(true)
      target.value = ""
    })
  }

  function handleClickMenu() {
    setPopoverMenuOpened(false)
  }

  return (
      <>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box sx={{background: 'white', width: '30%', display: 'flex'}}>
            <InputBase
                sx={{ml: 1, flex: 1}}
                placeholder="Search FileType"
                inputProps={{'aria-label': 'search'}}
                onChange={e => handleSearchSnippet(e.target.value)}
            />
            <IconButton type="button" sx={{p: '10px'}} aria-label="search">
              <Search/>
            </IconButton>
          </Box>
            <Button
                ref={popoverRef}
                variant="contained"
                disableRipple
                sx={{ boxShadow: 0 }}
                onClick={() => {
                    setPopoverMenuOpened(true);
                    fetchHelloFromPermissions(); // Llama a la función cuando se presiona el botón
                }}
            >
                <Add />
                Add Snippet
            </Button>
        </Box>
        <Table size="medium" sx={{borderSpacing: "0 10px", borderCollapse: "separate"}}>
          <TableHead>
            <TableRow sx={{fontWeight: 'bold'}}>
              <StyledTableCell sx={{fontWeight: "bold"}}>Name</StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>Language</StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>Author</StyledTableCell>
              <StyledTableCell sx={{fontWeight: "bold"}}>Conformance</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{
            loading ? (
                <>
                  {Array.from({length: 10}).map((_, index) => (
                      <LoadingSnippetRow key={index}/>
                  ))}
                </>
            ) : (
                <>
                  {
                      snippets && snippets.map((snippet) => (
                          <SnippetRow data-testid={"snippet-row"}
                                      onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet}/>
                      ))
                  }
                </>
            )
          }
          </TableBody>
          <TablePagination count={count} page={page} rowsPerPage={pageSize}
                           onPageChange={(_, page) => handleGoToPage(page)}
                           onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))}/>
        </Table>
        <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
                         onClose={() => setAddModalOpened(false)}/>
        <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClick={handleClickMenu}>
          <MenuItem onClick={() => setAddModalOpened(true)}>Create snippet</MenuItem>
          <MenuItem onClick={() => inputRef?.current?.click()}>Load snippet from file</MenuItem>
        </Menu>
        <input hidden type={"file"} ref={inputRef} multiple={false} data-testid={"upload-file-input"}
               onChange={e => handleLoadSnippet(e?.target)}/>
      </>
  )
}


export const StyledTableCell = styled(TableCell)`
    border: 0;
    align-items: center;
`
