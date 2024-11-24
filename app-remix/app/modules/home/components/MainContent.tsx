import { Title } from './Title';
import { TextInput } from './TextInput';
import { ActionButtons } from './ActionButtons';
import { useMemo } from 'react';
import { generateId } from '~/shared/utils/id-generator';
import { StoreProvider } from '~/shared/hooks/store';

export const MainContent = () => {
    const chatId = useMemo(generateId, []);
    
    return (
        <div className="w-full flex flex-col gap-8 h-3/6 text-center items-center">
            <StoreProvider roomId={chatId}>
                <Title />
                <div className="w-full">
                    <TextInput />
                    <ActionButtons />
                </div>
            </StoreProvider>
        </div>
    );
};
