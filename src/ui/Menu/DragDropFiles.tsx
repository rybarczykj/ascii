import React, { ReactElement } from 'react';

// wrapper around children to allow drag and drop of files
export const DragDropFiles = ({
    children,
    onDrop,
}: {
    children: React.ReactNode;
    onDrop: (file: File) => void;
}): ReactElement => {
    const onDropHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            const file = e.dataTransfer.files[0];
            onDrop(file);
        }
    };

    const onDragOverHandler = (e) => e.preventDefault();

    return (
        <div onDrop={onDropHandler} onDragOver={onDragOverHandler}>
            {children}
        </div>
    );
};
