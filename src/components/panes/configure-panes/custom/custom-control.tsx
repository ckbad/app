import * as React from 'react';
import {AccentSlider} from '../../../inputs/accent-slider';
import {AccentSelect} from '../../../inputs/accent-select';
import {AccentRange} from '../../../inputs/accent-range';
import {ControlRow, Label, Detail} from '../../grid';
import {VIADefinitionV2, VIAItem, VIAControlItem} from 'via-reader';
import {LightingData} from '../../../../types';
import {ColorPicker} from '../../../inputs/color-picker';

type Props = {
  lightingData: LightingData;
  definition: VIADefinitionV2;
};

export type ControlMeta = [
  string | React.FC<AdvancedControlProps>,
  {type: string} & Partial<{
    min: number;
    max: number;
    getOptions: (d: VIADefinitionV2) => string[];
  }>
];

type AdvancedControlProps = Props & {meta: ControlMeta};
const AdvancedColorPicker = props => {
  const {color, setColor} = props;
  return (
    <ColorPicker color={{hue: color[0], sat: color[1]}} setColor={setColor} />
  );
};

export const VIACustomItem = React.memo(
  (props: VIAItem & {updateValue; value: number[]; _id: string}) => (
    <ControlRow id={props._id}>
      <Label>{props.label}</Label>
      <Detail>
        {'type' in props ? (
          <VIACustomControl {...props} value={Array.from(props.value)} />
        ) : (
          props.content
        )}
      </Detail>
    </ControlRow>
  )
);

type ControlGetSet = {
  value: number[];
  updateValue: (name: string, ...command: number[]) => void;
};

type VIACustomControlProps = VIAControlItem & ControlGetSet;

const boxOrArr = elem => (Array.isArray(elem) ? elem : [elem]);

// we can compare value against option[1], that way corrupted values are false
const valueIsChecked = (option: number | number[], value: number[]) =>
  boxOrArr(option).every((o, i) => o == value[i]);

export const VIACustomControl = (props: VIACustomControlProps) => {
  const {content, type, options, value} = props as any;
  const [name, ...command] = content;
  switch (type) {
    case 'range': {
      return (
        <AccentRange
          min={options[0]}
          max={options[1]}
          defaultValue={props.value[0]}
          onChange={(val: number) => props.updateValue(name, ...command, val)}
        />
      );
    }

    case 'toggle': {
      const toggleOptions: any[] = options || [0, 1];
      return (
        <AccentSlider
          isChecked={valueIsChecked(toggleOptions[1], props.value)}
          onChange={val =>
            props.updateValue(
              name,
              ...command,
              ...boxOrArr(toggleOptions[+val])
            )
          }
        />
      );
    }
    case 'dropdown': {
      const selectOptions = options.map(([label, value], idx) => ({
        value: value || idx,
        label
      }));
      return (
        <AccentSelect
          width={250}
          onChange={option => props.updateValue(name, ...command, option.value)}
          options={selectOptions}
          defaultValue={selectOptions.find(p => value[0] === p.value)}
        />
      );
    }
    case 'color': {
      return (
        <AdvancedColorPicker
          color={props.value}
          setColor={(hue, sat) => props.updateValue(name, ...command, hue, sat)}
        />
      );
    }
  }
  return null;
};
