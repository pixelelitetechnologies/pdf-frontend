import React, {useEffect, useState} from "react";
import {ReactStateDeclaration, UISref} from "@uirouter/react";
import {Button, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography,} from "@material-ui/core";
import {Edit, File, Share2, Trash, Upload} from "react-feather";
import {FileType} from "../types";
import {$crud} from "../factories/CrudFactory";
import {ShareDialog} from "../Dialogs/ShareDialog";
import {generateFormData} from "../helpers";
import {EmptyContainer} from "./EmptyContainer";
import {Loading} from "./Loading";

export function Files() {
    let [limit] = useState(10);
    let [page, setPage] = useState(1);
    const [files, setFiles] = useState<FileType[]>([]);
    const [file, setFile] = useState<FileType>(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    let [searchValue, setSearchValue] = useState<string>("");

    const retrieveFiles = async () => {
        try {
            setLoading(true);
            const {data} = await $crud.post("file/list-files", {
                limit,
                page,
                cond: {search: searchValue},
            });
            setFiles(data);
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async (id) => {
        await $crud.confirm({
            textContent: "This file won't be revert.",
        });
        await $crud.put(`file/delete-file/${id}`);
        retrieveFiles();
    };

    const uploadFile = async () => {
        setLoading(true);
        try {
            const file = await $crud.chooseFile({accept: "application/pdf"});
            await $crud.post(
                "file/add-file",
                generateFormData({
                    filename: file,
                    docname: file.name,
                })
            );
        } finally {
            retrieveFiles();
            setLoading(false);
        }
    };

    useEffect(() => {
        retrieveFiles();
    }, []);

    useEffect(() => {
    }, []);

    const searchData = async (e) => {
        searchValue = e.target.value;

        await setSearchValue(e.target.value);

        if (searchValue !== "") {
            retrieveFiles();
        } else {
            setSearchValue("");
            retrieveFiles();
        }
    };

    return (
        <Grid className="p-2 p-2-all">
            <Grid container alignItems="center" className="p-2-all">
                <Typography
                    component={Grid}
                    item
                    xs
                    variant="h5"
                    className="font-weight-bold"
                >
                    PDF Files
                </Typography>

                <Grid>
                    <TextField
                        fullWidth
                        label="Search"
                        value={searchValue}
                        onChange={searchData}
                        variant="outlined"
                        size="small"
                        color="primary"
                    />
                </Grid>
                <Grid>
                    <Button variant="outlined" onClick={uploadFile}>
                        <Upload size={16} className="mr-2"/> Upload
                    </Button>
                </Grid>
            </Grid>
            {!loading ? (
                files.length !== 0 ? (
                    <Grid container alignItems="center" className="p-2-all">
                        {files.map((file, index) => (
                            <Grid item xs={6} md={4} lg={3} key={index}>
                                <Paper elevation={1}>
                                    <Grid container alignItems="center">
                                        <Grid
                                            item
                                            xs={12}
                                            className="p-3 text-center position-relative"
                                        >
                                            <File size={180} className="text-success"/>
                                            <IconButton
                                                style={{top: 12, right: 12}}
                                                className="position-absolute"
                                                onClick={() => {
                                                    setShow(true);
                                                    setFile(file);
                                                }}
                                            >
                                                <Tooltip title="Share File For Signature">
                                                    <Share2 size={20}/>
                                                </Tooltip>
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider/>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            container
                                            alignItems="center"
                                            className="p-2"
                                        >
                                            <Typography
                                                component={Grid}
                                                item
                                                xs
                                                variant="body2"
                                                className="p-1 font-weight-bold"
                                            >
                                                {file.docname}
                                            </Typography>
                                            <UISref to="fileViewer" params={{fileId: file._id}}>
                                                <IconButton>
                                                    <Edit size={16}/>
                                                </IconButton>
                                            </UISref>
                                            <IconButton onClick={() => deleteFile(file._id)}>
                                                <Trash className="text-danger" size={16}/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid className="p-md-5">
                        <EmptyContainer content="You don't have any uploaded file"/>
                    </Grid>
                )
            ) : (
                <Loading/>
            )}
            <ShareDialog
                fileId={file?._id}
                open={show}
                onClose={() => setShow(false)}
            />
        </Grid>
    );
}

export const states: ReactStateDeclaration[] = [
    {
        url: "/files",
        name: "files",
        data: {
            title: "Files",
            loggedIn: true,
        },
        component: Files,
    },
];
