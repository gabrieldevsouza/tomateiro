@tool
extends AspectRatioContainer
class_name HStackableRatioContainer

@onready var container: BoxContainer = get_parent()

@export var ratio_limited_by_parent_width : bool = true

@export_range(0.001, 10) var stack_ratio : float = 1 :
	set(value):

		if container == null:
			container = get_parent()

		if container != null:
			if value * container.size.y > container.get_parent_area_size().x and ratio_limited_by_parent_width:
				value = container.get_parent_area_size().x / container.size.y

		stack_ratio = value
		compute()


@export_range(0.001, 1) var item_scale : float = 1.0 :
	set(value):
		item_scale = value
		compute()

func _ready() -> void:
	container = get_parent()
	resized.connect(compute)
	get_tree().get_root().size_changed.connect(on_screen_resized)


func compute() -> void:
	if container == null:
		container = get_parent()
		if container == null:
			return
	custom_minimum_size.x =  container.size.y * stack_ratio * item_scale

func on_screen_resized() -> void:
	await get_tree().create_timer(1).timeout
	custom_minimum_size.x = 10
	compute()