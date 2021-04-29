// newTimeTrend.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useState, useContext, useEffect } from 'react';
import {
  CustomTextField,
  SimpleDropDown,
  SectionContainer,
  CustomTabs,
  CustomDatePicker,
  DropDownItem,
  IconToolBarItem,
} from '@ptas/react-ui-library';
import { Link } from 'react-router-dom';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { makeStyles, Box, Divider } from '@material-ui/core';

import SalesData from './SalesData';
import DatasetTree from './DatasetTree';
import { NewTimeTrendContext } from 'context/NewTimeTrendContext';
import CustomHeader from 'components/common/CustomHeader';

const useStyles = makeStyles((theme) => ({
  projectDetailsContainer: {
    padding: theme.spacing(4, 2, 1, 3),
  },
  projectDetailsTop: {
    width: 548,
    minWidth: 548,
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(3),
  },
  projectDetailsBottom: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  datePicker: {
    minWidth: 172,
    width: 172,
    marginRight: theme.spacing(2),
  },
  dropdown: {
    minWidth: 172,
    width: 172,
  },
  tabs: {
    marginLeft: theme.spacing(3),
  },
  projectTypeDropdown: {
    marginRight: theme.spacing(4),
    flexGrow: 2,
    width: 'unset',
  },
  nameTextField: {
    flexGrow: 1,
  },
  commentsTextField: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  link: {
    color: theme.ptas.colors.theme.black,
  },
}));

/**
 * NewTimeTrend
 *
 * @param props - Component props
 * @returns A JSX element
 */
function NewTimeTrend(): JSX.Element {
  const classes = useStyles();
  const [salesSwitch, setSalesSwitch] = useState<number>(0);
  const [populationSwitch, setPopulationSwitch] = useState<number>(0);
  const [projectTypesItems, setProjectTypesItems] = useState<DropDownItem[]>(
    []
  );
  const [areas, setAreas] = useState<DropDownItem[]>([]);

  const context = useContext(NewTimeTrendContext);

  const [year, setYear] = useState<Date>(new Date());
  const [areaDropdownValue, setAreaDropdownValue] = useState<React.ReactText>();

  useEffect(() => {
    setYear(new Date(`01/01/${context.assessmentYear}`));

    if (
      !context.setAssessmentDateFrom ||
      !context.assessmentYear ||
      !context.setAssessmentDateTo
    )
      return;

    context.setAssessmentDateFrom(
      new Date(`01/01/${context.assessmentYear - 3}`)
    );
    context.setAssessmentDateTo(new Date(`01/01/${context.assessmentYear}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.assessmentYear]);

  useEffect(() => {
    const items: DropDownItem[] = [];
    context.projectTypes?.projectTypes.forEach((p) => {
      items.push({
        label: p.projectTypeName,
        value: p.projectTypeId,
      });
    });
    setProjectTypesItems(items);
  }, [context.projectTypes]);

  useEffect(() => {
    const items: DropDownItem[] = [];
    context.salesAreas?.results.forEach((a) => {
      items.push({
        label: a.Key,
        value: a.Value,
      });
    });
    setAreas(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.salesAreas?.results]);

  const headerIcons: IconToolBarItem[] = [
    {
      icon: <InsertDriveFileIcon />,
      text: 'Create model',
      onClick: async (): Promise<void> => {
        if (context.createModel)
          await context.createModel(salesSwitch, populationSwitch);
      },
      disabled:
        !context.selectedProjectType ||
        !context.assessmentYear ||
        !context.assessmentDateTo ||
        !context.assessmentDateFrom ||
        !context.projectName ||
        (salesSwitch === 0
          ? context.salesSelectedAreas && context.salesSelectedAreas.length < 1
          : !context.salesTreeSelection) ||
        (populationSwitch === 0
          ? context.populationSelectedAreas &&
            context.populationSelectedAreas.length < 1
          : !context.populationTreeSelection),
    },
  ];

  // const Tab = ({
  //   onSelected,
  //   defaultSelection,
  // }: Omit<CustomTabsProps, 'items' | 'classes'>): JSX.Element => (
  //   <CustomTabs
  //     items={['Area', 'Dataset']}
  //     defaultSelection={defaultSelection}
  //     onSelected={onSelected}
  //     classes={{
  //       root: classes.tabs,
  //     }}
  //     switchVariant
  //     invertColors
  //   />
  // );

  const handleSelected = (e: DropDownItem): void => {
    const filtered = context.projectTypes?.projectTypes.filter(
      (f) => f.projectTypeId === e.value
    );
    context.setSelectedProjectType &&
      context.setSelectedProjectType(
        filtered && filtered.length > 0 ? filtered[0] : null
      );
  };

  const handleDropdownSelect = (e: DropDownItem): void => {
    if (
      !context.populationSelectedAreas ||
      !context.salesSelectedAreas ||
      !context.setPopulationSelectedAreas ||
      !context.setSalesSelectedAreas ||
      !context.setSelectedProjectArea
    )
      return;

      setAreaDropdownValue(e.value);
      context.setSelectedProjectArea(e.value as number);

      context.salesSelectedAreas.shift();
      context.populationSelectedAreas.shift();

      const filteredSales = context.salesSelectedAreas.filter(a => a !== e.value as number);

      context.setSalesSelectedAreas([e.value as number, ...filteredSales]);
      context.setPopulationSelectedAreas([e.value as number, ...context.populationSelectedAreas]);
  };

  return (
    <Fragment>
      <CustomHeader
        route={[
          <Link to="/models" className={classes.link}>
            Models
          </Link>,
          <label>New model</label>,
        ]}
        icons={headerIcons}
      />
      <Box className={classes.projectDetailsContainer}>
        <Box className={classes.projectDetailsTop}>
          <SimpleDropDown
            label="Model type"
            items={projectTypesItems}
            onSelected={(e): void => handleSelected(e)}
            classes={{ root: classes.projectTypeDropdown }}
            value={
              !context.selectedProjectType
                ? ''
                : projectTypesItems.find(
                    (p) =>
                      p.label === context.selectedProjectType?.projectTypeName
                  )?.value
            }
          />
          <CustomTextField
            label="Name"
            className={classes.nameTextField}
            onChange={(e): void =>
              context.setProjectName && context.setProjectName(e.target.value)
            }
          />
          <CustomTextField
            className={classes.commentsTextField}
            label="Comments"
            onChange={(e): void =>
              context.setComments && context.setComments(e.target.value)
            }
            multiline
          />
        </Box>
        <Divider />
        <Box className={classes.projectDetailsBottom}>
          <CustomDatePicker
            views={['year']}
            format="yyyy"
            label="Assessment year"
            value={year}
            onChange={(e): void =>
              context.setAssessmentYear &&
              context.setAssessmentYear(e?.getFullYear())
            }
            className={classes.datePicker}
          />
          <CustomDatePicker
            label="From"
            onChange={(e): void =>
              context.setAssessmentDateFrom && context.setAssessmentDateFrom(e)
            }
            className={classes.datePicker}
            value={context.assessmentDateFrom}
          />
          <CustomDatePicker
            label="To"
            onChange={(e): void =>
              context.setAssessmentDateTo && context.setAssessmentDateTo(e)
            }
            className={classes.datePicker}
            value={context.assessmentDateTo}
          />
          <SimpleDropDown
            label="Area from"
            items={areas}
            onSelected={handleDropdownSelect}
            classes={{ root: classes.dropdown }}
            disabled={!context.selectedProjectType}
            value={areaDropdownValue}
          />
        </Box>
      </Box>
      <SectionContainer
        title="Sales data"
        miscContent={
          <CustomTabs
            items={['Area', 'Dataset']}
            defaultSelection={salesSwitch}
            onSelected={(e: number): void => setSalesSwitch(e)}
            classes={{
              root: classes.tabs,
            }}
            switchVariant
            invertColors
            disabled={!context.selectedProjectType}
          />
        }
      >
        {salesSwitch === 0 ? (
          <SalesData
            onSelectedItem={(values, isSelected): void =>
              context.onSetArea &&
              context.onSetArea(isSelected, 'sales', values)
            }
            selectedItems={context.salesSelectedAreas}
          />
        ) : (
          <DatasetTree
            onRowClick={context.setSalesTreeSelection}
            type="sales"
          />
        )}
      </SectionContainer>
      <SectionContainer
        title="Population data"
        miscContent={
          <CustomTabs
            items={['Area', 'Dataset']}
            defaultSelection={populationSwitch}
            onSelected={(e: number): void => setPopulationSwitch(e)}
            classes={{
              root: classes.tabs,
            }}
            switchVariant
            invertColors
            disabled={!context.selectedProjectType}
          />
        }
      >
        {populationSwitch === 0 ? (
          <SalesData
            onSelectedItem={(values, _isSelected, text): void =>
              // context.onSetArea &&
              // context.onSetArea(isSelected, 'population', values)
              handleDropdownSelect({label: `${text}`, value: values})
            }
            selectedItems={context.populationSelectedAreas}
            type="population"
          />
        ) : (
          <DatasetTree
            onRowClick={(e): void =>
              context.setPopulationTreeSelection &&
              context.setPopulationTreeSelection(e)
            }
            type="population"
          />
        )}
      </SectionContainer>
    </Fragment>
  );
}

export default NewTimeTrend;
