declare class Bus {
	emit(event: string, options: Object, callback?: Function): void;
	on(event: string, callback: Function, priority?: number): void;
}
