import { Inject, Injectable } from '@angular/core';
import {
  CreationIdentifiersEnum,
  DeletionIdentifiersEnum,
  EditionIdentifiersEnum,
  PageTypeEnum,
  ProviderPageEnum,
  ProviderTypeEnum,
} from '../models/data-request-api';
import {
  DataHttpService,
  OrganizerDataMode,
  ActivityDataModeCreation,
  ActivityDataModeEdition,
} from './dataHttp.service';
import { of } from 'rxjs';
import {
  ActivityEntry,
  EntryType,
  OrganizeEntry,
  isActivityEntry,
  isOrganizerEntry,
} from '../models/app_data_state';
import { PageRequestParams } from '../models/table';

type GKeys = OrgKeysType | ActKeysType;
type OrgKeysType = Partial<{
  [x in keyof OrganizeEntry]: string;
}>;
type ActKeysType = Partial<{
  [x in keyof ActivityEntry]: string;
}>;
type KeysType<Type extends OrgKeysType | ActivityEntry> =
  Type extends ActivityEntry
    ? ActivityEntry
    : Type extends OrgKeysType
    ? OrgKeysType
    : never;

@Injectable({
  providedIn: 'root',
})
export class EntryService {
  constructor(private dataHttpService: DataHttpService) {}

  public getEntries(
    providerType: ProviderTypeEnum,
    params: PageRequestParams = { properties: '*' }
  ) {
    let pageProvider =
      providerType === ProviderTypeEnum.Organizer
        ? ProviderPageEnum.PP_Organizar
        : ProviderPageEnum.PP_Activity;

    return this.dataHttpService.getData(pageProvider, params);
  }

  public saveUpdateEntry(
    providerType: ProviderTypeEnum,
    formValue: Partial<EntryType>,
    pageType: PageTypeEnum,
    u_id?: string
  ) {
    let is_organizer = providerType === ProviderTypeEnum.Organizer;
    let creationIdentifier =
      pageType === PageTypeEnum.New
        ? is_organizer
          ? CreationIdentifiersEnum.Organizer
          : CreationIdentifiersEnum.Activity
        : is_organizer
        ? EditionIdentifiersEnum.Organizer
        : EditionIdentifiersEnum.Activity;
    let data_form:
      | OrganizerDataMode
      | ActivityDataModeCreation
      | ActivityDataModeEdition;
    if (
      pageType === PageTypeEnum.Edit &&
      providerType === ProviderTypeEnum.Activity
    ) {
      console.log('---------->', pageType, providerType);
      data_form = { properties: formValue };
    } else {
      data_form = is_organizer
        ? formValue
        : {
            activity: formValue,
          };
    }

    if (pageType === PageTypeEnum.New)
      return this.dataHttpService.createEntry(
        creationIdentifier as CreationIdentifiersEnum,
        providerType === ProviderTypeEnum.Activity
          ? (data_form as ActivityDataModeCreation)
          : data_form
      );
    else if (pageType === PageTypeEnum.Edit)
      return this.dataHttpService.updateEntry(
        creationIdentifier as EditionIdentifiersEnum,
        providerType === ProviderTypeEnum.Activity
          ? (data_form as ActivityDataModeEdition)
          : data_form,
        u_id!
      );
    else return of('Something Wrong !!!');
  }

  public deleteEntry(providerType: ProviderTypeEnum, entry: EntryType) {
    let deletion_identifier =
      providerType === ProviderTypeEnum.Organizer
        ? DeletionIdentifiersEnum.Organizer
        : DeletionIdentifiersEnum.Activity;
    console.log(entry);
    return this.dataHttpService.deleteEntry(entry.uid, deletion_identifier);
  }

  //storage
  public getEntryInfo() {
    let pure_entry = localStorage.getItem('entry');
    if (pure_entry) {
      let entry = JSON.parse(pure_entry) as EntryType;
      if (isActivityEntry(entry)) return entry;
      else if (isOrganizerEntry(entry)) return entry;
    }
    return null;
  }
  public storgeEntryInfo(entry: EntryType) {
    localStorage.setItem('entry', JSON.stringify(entry));
  }
}
