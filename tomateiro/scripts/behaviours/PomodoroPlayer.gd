extends Node
class_name PomodoroPlayer

@export var cycle_time : CycleTimeController

@export var pomodoro_timer_label : Label

@export var play_btn : AutoSizeMaterialButton
@export var pause_btn : AutoSizeMaterialButton
@export var repeat_btn : BaseButton


func _ready() -> void:
	play_btn.pressed.connect(on_btn_play_pressed)
	pause_btn.pressed.connect(on_btn_pause_pressed)
	repeat_btn.pressed.connect(on_btn_repeat_pressed)

	cycle_time.tick_signal.connect(on_tick)
	cycle_time.repeat_signal.connect(on_repeat)
	cycle_time.prepare_signal.connect(on_prepare)

	pause_btn.visible = false
	play_btn.visible = true

func on_btn_play_pressed() -> void:
	pause_btn.set_font_size(play_btn.get_font_size())

	play_btn.visible = false
	pause_btn.visible = true

	cycle_time.play()

func on_btn_pause_pressed() -> void:
	pause_btn.set_font_size(pause_btn.get_font_size())

	pause_btn.visible = false
	play_btn.visible = true
	
	cycle_time.pause()

func on_btn_repeat_pressed() -> void:
	cycle_time.repeat()
	pause_btn.visible = false
	play_btn.visible = true

func on_prepare() -> void:
	pomodoro_timer_label.set_text(formart_time(cycle_time.remaining_seconds.value))

func on_tick() -> void:
	pomodoro_timer_label.set_text(formart_time(cycle_time.remaining_seconds.value))

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(time) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time

func on_repeat() -> void:
	pomodoro_timer_label.set_text(formart_time(cycle_time.remaining_seconds.value))
