import React, { ReactElement } from 'react';

interface DragDropFilesProps {
    children: React.ReactNode;
    onDrop: (file: File) => void;
}

/**
 * Wrapper component to allow drag and drop of files
 */
export const DragDropFiles = ({
    children,
    onDrop,
}: DragDropFilesProps): ReactElement => {
    const onDropHandler = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            onDrop(file);
        }
    };

    const onDragOverHandler = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    return (
        <div onDrop={onDropHandler} onDragOver={onDragOverHandler}>
            {children}
        </div>
    );
};


