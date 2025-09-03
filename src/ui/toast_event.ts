// Author: Preston Lee

import { ToastEventTypes } from './toast_event_types.js';

export interface ToastEvent {
    type: ToastEventTypes;
    title: string;
    message: string;
}
