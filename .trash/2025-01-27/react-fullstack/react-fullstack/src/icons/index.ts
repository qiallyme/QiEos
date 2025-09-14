/// <reference types="vite-plugin-svgr/client" />
import { makeIcon } from './makeIcon';

import { ReactComponent as UserProfileImg } from './userProfile.svg';
//<-- IMPORT ICON FILE -->

export const UserProfileIcon = makeIcon(UserProfileImg);
//<-- EXPORT ICON COMPONENT -->
