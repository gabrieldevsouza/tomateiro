extends Resource
class_name RoundController

@export var setup_focus_max_cycle_amount : IntVar

@export var setup_focus_time : FloatVar
@export var setup_rest_time : FloatVar
@export var setup_long_rest_time : FloatVar

var current_cycle_time : float = 0

var real_cycles_amount : int = 0
var current_cycle : IntVar

signal reset_signal

func bootstrap() -> void:

	load_resources()

	real_cycles_amount = setup_focus_max_cycle_amount.value * 2

	setup_current_cycle_time()


func load_resources() -> void:
	current_cycle = ResourceLoader.load("user://setup_focus_max_cycle_amount.tres")

	if current_cycle == null:
		current_cycle = IntVar.new()
		current_cycle.value = 1

	save_current_cycle()

func iterate_cycle() -> void:
	current_cycle.value += 1

	if current_cycle.get_value() > real_cycles_amount:
		current_cycle.value = 1

	save_current_cycle()

	setup_current_cycle_time()

func is_focus_cycle() -> bool:
	return current_cycle.get_value() % 2 == 1

func is_long_rest_cycle() -> bool:
	return current_cycle.get_value() / 2 == setup_focus_max_cycle_amount.value

func setup_current_cycle_time() -> void:
	if is_long_rest_cycle():
		current_cycle_time = setup_long_rest_time.value
	elif is_focus_cycle():
		current_cycle_time = setup_focus_time.value
	else:
		current_cycle_time = setup_rest_time.value

func reset_current_cycle() -> void:
	if not is_focus_cycle():
		return

	current_cycle.value = 1

	save_current_cycle()

	reset_signal.emit()

func save_current_cycle() -> void:
	ResourceSaver.save(current_cycle, "user://setup_focus_max_cycle_amount.tres")

func prepare_next_cycle() -> void:

	iterate_cycle()

func can_user_play() -> bool:
	return current_cycle.get_value() % 2 != 0
