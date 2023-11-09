import { Inject, Injectable } from '@angular/core';
import {
  CreationIdentifiersEnum,
  DeletionIdentifiersEnum,
  EditionIdentifiersEnum,
  PageRequestParams,
  PageTypeEnum,
  ProviderPageEnum,
  ProviderTypeEnum,
} from '../models/data-request-api';
import {
  DataHttpService,
  OrganizerDataMode,
  ActivityDataMode,
} from './dataHttp.service';
import { of } from 'rxjs';
import {
  ActivityEntry,
  EntryType,
  OrganizeEntry,
  isActivityEntry,
  isOrganizerEntry,
} from '../models/app_data_state';
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
    let data_form: OrganizerDataMode | ActivityDataMode = is_organizer
      ? formValue
      : {
          activity: formValue,
        };
    if (pageType === PageTypeEnum.New)
      return this.dataHttpService.createEntry(
        creationIdentifier as CreationIdentifiersEnum,
        data_form
      );
    else if (pageType === PageTypeEnum.Edit)
      return this.dataHttpService.updateEntry(
        creationIdentifier as EditionIdentifiersEnum,
        data_form,
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
  public mapPureDataToEntries(
    providerType: ProviderTypeEnum,
    pure_response: any
  ) {
    let entries: EntryType[] = [];
    if (providerType === ProviderTypeEnum.Organizer)
      entries = pure_response.entries.map((e: any) => ({
        uid: e.uid,
        'dc:created': e.properties['dc:created'],
        'dc:modified': e.properties['dc:modified'],
        'dc:creator': e.properties['dc:creator'],
        'organizer:name': e.properties['organizer:name'],
        'organizer:website': e.properties['organizer:website'],
        'organizer:emails': e.properties['organizer:emails'],
        'organizer:addresses': e.properties['organizer:addresses'],
        'organizer:organizationActivity':
          e.properties['organizer:organizationActivity'],
        'organizer:phones': e.properties['organizer:phones'],
      }));
    else if (providerType === ProviderTypeEnum.Activity)
      entries = pure_response.entries.map((e: any) => ({
        uid: e.uid,
        'dc:created': e.properties['dc:created'],
        'dc:modified': e.properties['dc:modified'],
        'dc:creator': e.properties['dc:creator'],
        'dc:title': e.properties['dc:title'],
        'dc:description': e.properties['dc:description'],
        'activity:organizers': e.properties['activity:organizers'],
        'activity:locations': e.properties['activity:locations'],
        'activity:startDate': e.properties['activity:startDate'],
        'activity:endDate': e.properties['activity:endDate'],
        'activity:timeFrom': e.properties['activity:timeFrom'],
        'activity:timeTo': e.properties['activity:timeTo'],
      }));
    return entries;
  }
  public entryPropertiesAllowedToAppearInTable(providerType: ProviderTypeEnum) {
    console.log(providerType);
    let coulumns = [
      'dc:title',
      'dc:creator',
      'dc:description',
      'dc:created',
      'dc:modified',
    ];
    if (providerType === ProviderTypeEnum.Organizer) {
      coulumns = [
        'organizer:name',
        'dc:creator',
        'organizer:website',
        'dc:created',
        'dc:modified',
      ];
    }
    return coulumns;
  }
}