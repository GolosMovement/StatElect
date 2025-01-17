import React from 'react';
import { deepEqual } from '.';

import { Select, Spin, Tooltip } from 'antd';
import { OptionProps, SelectValue } from 'antd/lib/select';

export interface ILazySelectProps<TItem, TValue> {
    selectedValue: TValue | TValue[] | null;
    itemsPromise: Promise<TItem[]>;
    getValue: (value: TItem) => TValue;
    getText: (value: TItem) => string;
    getDescriptionText?: (value: TItem) => string;
    onChange: (newSelectedValue: TValue | null) => void;
    onChangeMultiple?: (values: TValue[] | null) => void;
    placeholder?: string;
    allowClear?: boolean;
    className?: string;
    mode?: 'default' | 'multiple' | 'tags' | 'combobox';
}

interface ILazySelectState<TItem>
{
    items: TItem[];
    itemsPromise: Promise<TItem[]> | null;
}

export class LazySelect<TItem, TValue>
    extends React.Component<ILazySelectProps<TItem, TValue>, ILazySelectState<TItem>> {
    constructor(props: ILazySelectProps<TItem, TValue>) {
        super(props);
        this.state = {
            items: [],
            itemsPromise: null
        };
    }

    public render(): JSX.Element {
        if (this.isLoading()) {
            return <Spin />;
        } else {
            return (
                <Select
                    showSearch
                    mode={this.mode()}
                    allowClear={this.props.allowClear}
                    className={this.className()}
                    placeholder={this.props.placeholder}
                    optionFilterProp='children'
                    filterOption={this.filterOption}
                    value={this.getSelectedText()}
                    onChange={this.onChange}>
                    {this.options()}
                </Select>
            );
        }
    }

    public componentWillMount() {
        this.loadData();
    }

    public componentDidUpdate() {
        if (this.isLoading()) {
            this.loadData();
        }
    }

    private loadData() {
        this.props.itemsPromise.then((items) => {
            this.setState({
                    items: items,
                    itemsPromise: this.props.itemsPromise
                });
        });
    }

    private filterOption(input: string, option: React.ReactElement<OptionProps>) {
        return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    private getSelectedText() {
        if (this.props.selectedValue == null ||
            (Array.isArray(this.props.selectedValue) && this.props.selectedValue.length == 0)) {
            return undefined;
        } else if (this.props.mode == 'multiple' && Array.isArray(this.props.selectedValue)) {
            const selectedItems = this.state.items.filter((item) =>
                (this.props.selectedValue as TValue[]).indexOf(this.props.getValue(item)) != -1);
            return selectedItems.map((item) => this.props.getText(item));
        } else {
            const selectedItem = this.state.items.filter((item) =>
                deepEqual(this.props.getValue(item), this.props.selectedValue))[0];
            return this.props.getText(selectedItem);
        }
    }

    private isLoading() {
        return this.state.itemsPromise !== this.props.itemsPromise;
    }

    private onChange = (value: SelectValue, option: React.ReactElement<any> | Array<React.ReactElement<any>>) => {
        if (option == null) {
            this.props.onChange(null);
        } else if (this.props.mode == 'multiple') {
            const selected = option as Array<React.ReactElement<any>>;

            if (this.props.onChangeMultiple) {
                this.props.onChangeMultiple(selected.map((opt) =>
                    this.props.getValue(this.state.items[opt.key as number])));
            }
        } else {
            const selectedKey = (option as React.ReactElement<any>).key as number;
            const selectedItem = this.state.items[selectedKey];
            this.props.onChange(this.props.getValue(selectedItem));
        }
    }

    private mode(): 'default' | 'multiple' | 'tags' | 'combobox' {
        return this.props.mode ? this.props.mode : 'default';
    }

    private className(): string {
        return this.props.className ? this.props.className : 'fixed-width-select';
    }

    private options(): React.ReactNode {
        const options = this.state.items.map((item, index) =>
            <Select.Option key={index} value={this.props.getText(item)}>
                {this.optionText(item)}
            </Select.Option>
        );
        return options;
    }

    private optionText(item: TItem): React.ReactNode {
        if (this.props.getDescriptionText) {
            return (
                <Tooltip title={this.props.getDescriptionText(item)} placement='right'>
                    {this.props.getText(item)}
                </Tooltip>
            );
        } else {
            return this.props.getText(item);
        }
    }
}
